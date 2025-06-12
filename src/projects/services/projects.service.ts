import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs/promises';
import { createWriteStream, rmSync, unlinkSync } from 'fs';
import * as archiver from 'archiver';
import * as fsExtra from 'fs-extra';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  async exportarProyectoFlutter(
    pantallas: Record<string, string>,
    res: Response
  ): Promise<void> {
    try {
      const plantillaDir = path.join(process.cwd(), 'src', 'exportables', 'flutter-template');
      const tempDir = path.join(process.cwd(), 'temp', 'flutter-export');
      const zipPath = `${tempDir}.zip`;

      // Limpiar archivos anteriores
      try { rmSync(tempDir, { recursive: true, force: true }); } catch { }
      try { unlinkSync(zipPath); } catch { }

      await fsExtra.copy(plantillaDir, tempDir);
      const libDir = path.join(tempDir, 'lib');
      const screensDir = path.join(libDir, 'screens');
      await fs.mkdir(screensDir, { recursive: true });

      const normalizarNombre = (nombre: string) => {
        const limpio = nombre.trim().replace(/\s+/g, ' ');
        const camel = limpio.replace(/(^\w|\s\w)/g, m => m.toUpperCase()).replace(/\s/g, '');
        return {
          clase: `Pantalla${camel}`,
          file: `pantalla_${limpio.toLowerCase().replace(/\s+/g, '')}.dart`,
          ruta: `/${camel}`,
        };
      };

      const imports: string[] = [];
      const rutas: string[] = [];

      for (const [nombre, contenidoStr] of Object.entries(pantallas)) {
        const parsed = JSON.parse(contenidoStr);
        const { clase, file, ruta } = normalizarNombre(nombre);
        const widgetContent = this.generarWidget(parsed, Object.keys(pantallas));

        const pantallaCode = `
import 'package:flutter/material.dart';

class ${clase} extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: ${widgetContent}
        ),
      ),
    );
  }
}
        `;

        await fs.writeFile(path.join(screensDir, file), pantallaCode);
        imports.push(`import 'screens/${file}';`);
        rutas.push(`'${ruta}': (context) => ${clase}(),`);
      }

      const mainCode = `
import 'package:flutter/material.dart';
${imports.join('\n')}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: ${normalizarNombre(Object.keys(pantallas)[0]).clase}(),
      routes: {
        ${rutas.join('\n        ')}
      },
    );
  }
}
      `;
      await fs.writeFile(path.join(libDir, 'main.dart'), mainCode);

      // Crear ZIP
      const output = createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(output);
      archive.directory(tempDir, false);
      await archive.finalize();

      await new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });

      res.download(zipPath, 'proyecto_flutter.zip', () => {
        try { rmSync(tempDir, { recursive: true, force: true }); } catch { }
        try { unlinkSync(zipPath); } catch { }
      });

    } catch (error) {
      this.logger.error('[EXPORTAR] Error general', error);
      throw new InternalServerErrorException('No se pudo exportar el proyecto Flutter.');
    }
  }

  private generarWidget(nodoJson: any, pantallas: string[], depth = 2): string {
    const nodes = nodoJson;

    const colorToFlutter = (color: string) => {
      if (!color || color === 'transparent' || color === 'none') return 'Colors.transparent';
      if (color.startsWith('#')) return `Color(0xFF${color.slice(1)})`;
      return 'Colors.black';
    };

    const parsePx = (value?: string | number, fallback = 0): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace('px', '').trim();
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? fallback : parsed;
      }
      return fallback;
    };    

    const parseEdgeInsets = (value?: string): string => {
      if (!value) return 'EdgeInsets.all(0)';
      const parts = value.trim().split(/\s+/).map(px => parseInt(px.replace('px', '')) || 0);

      if (parts.length === 1) {
        return `EdgeInsets.all(${parts[0]})`;
      } else if (parts.length === 2) {
        return `EdgeInsets.symmetric(vertical: ${parts[0]}, horizontal: ${parts[1]})`;
      } else if (parts.length === 4) {
        return `EdgeInsets.fromLTRB(${parts[3]}, ${parts[0]}, ${parts[1]}, ${parts[2]})`;
      }

      return 'EdgeInsets.all(0)';
    };    

    const parseSize = (val?: string): string => {
      if (!val || val === 'auto') return 'null';
      if (val === '100%') return 'double.infinity';
      return parseInt(val.replace('px', ''))?.toString() || 'null';
    };

    const getMainAxis = (justify?: string) => {
      switch (justify) {
        case 'center': return 'MainAxisAlignment.center';
        case 'flex-end': return 'MainAxisAlignment.end';
        case 'space-between': return 'MainAxisAlignment.spaceBetween';
        case 'space-around': return 'MainAxisAlignment.spaceAround';
        default: return 'MainAxisAlignment.start';
      }
    };

    const getCrossAxis = (align?: string) => {
      switch (align) {
        case 'center': return 'CrossAxisAlignment.center';
        case 'flex-end': return 'CrossAxisAlignment.end';
        case 'stretch': return 'CrossAxisAlignment.stretch';
        default: return 'CrossAxisAlignment.start';
      }
    };

    const getTextAlign = (align?: string) => {
      switch (align) {
        case 'center': return 'TextAlign.center';
        case 'right': return 'TextAlign.right';
        case 'justify': return 'TextAlign.justify';
        default: return 'TextAlign.left';
      }
    };

    const renderNode = (id: string, lvl = depth): string => {
      const node = nodes[id];
      if (!node) return '';
      const indent = '  '.repeat(lvl);
      const props = node.props || {};

      const children = (node.nodes || []).map((childId, index) => {
        const widget = renderNode(childId, lvl + 2);
        const gap = parsePx(props.gap || props.rowGap || props.columnGap);
        const spacer = gap && index > 0 ? `${'  '.repeat(lvl + 2)}SizedBox(height: ${gap}),\n` : '';
        return `${spacer}${widget}`;
      }).join(',\n');

      switch (node.type.resolvedName) {
        case 'Text':
          return `${indent}Text(
    '${props.text || ''}',
    style: TextStyle(
      fontSize: ${parsePx(props.fontSize, 14)},
      color: ${colorToFlutter(props.color)},
      fontWeight: FontWeight.${props.fontWeight === 'bold' ? 'bold' : 'normal'},
      fontFamily: '${props.fontFamily || 'Arial'}',
      decoration: TextDecoration.${props.textDecoration === 'underline' ? 'underline' : props.textDecoration === 'line-through' ? 'lineThrough' : 'none'},
      letterSpacing: ${props.letterSpacing === 'normal' ? 0.0 : props.letterSpacing || 0.0},
    ),
    textAlign: ${getTextAlign(props.textAlign)},
  )`;

        case 'Button': {
          const onPressed = props.gotoScreen && pantallas.includes(props.gotoScreen)
            ? `() => Navigator.pushNamed(context, '/${props.gotoScreen.replace(/\s+/g, '')}')`
            : '() {}';

          return `${indent}Padding(
    padding: ${parseEdgeInsets(props.margin)},
    child: ElevatedButton(
      onPressed: ${onPressed},
      style: ElevatedButton.styleFrom(
        backgroundColor: ${colorToFlutter(props.background)},
        padding: ${parseEdgeInsets(props.padding)},
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(${parsePx(props.borderRadius)}),
        ),
      ),
      child: Text(
        '${props.text || 'Button'}',
        style: TextStyle(color: ${colorToFlutter(props.color)}),
      ),
    ),
  )`;
        }

        case 'Input':
          return `${indent}Padding(
    padding: ${parseEdgeInsets(props.margin)},
    child: TextField(
      decoration: InputDecoration(
        hintText: '${props.placeholder || ''}',
        contentPadding: ${parseEdgeInsets(props.padding)},
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(${parsePx(props.borderRadius)}),
          borderSide: BorderSide(color: ${colorToFlutter(props.border?.split(' ').at(-1))}),
        ),
      ),
    ),
  )`;

        case 'Checkbox':
          return `${indent}Row(
    children: [
      Checkbox(value: false, onChanged: (_) {}),
      Text('${props.label || ''}')
    ],
  )`;

        case 'Image': {
          if (!props.src) return `${indent}SizedBox.shrink()`;

          const width = parseSize(props.width);
          const height = parseSize(props.height);
          const borderRadius = parsePx(props.borderRadius);
          const borderColor = colorToFlutter(props.border?.split(' ').at(-1));
          const margin = parseEdgeInsets(props.margin);
          const padding = parseEdgeInsets(props.padding);

          return `${indent}Container(
      width: ${width},
      height: ${height},
      margin: ${margin},
      padding: ${padding},
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(${borderRadius}),
        border: Border.all(color: ${borderColor}),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(${borderRadius}),
        child: Image.network(
          '${props.src}',
          fit: BoxFit.cover,
        ),
      ),
    )`;
        }  

        case 'Table':
          return `${indent}Table(
    border: TableBorder.all(color: ${colorToFlutter(props.border)}),
    children: [
      // TODO: generate table rows and columns
    ],
  )`;

        case 'Container': {
          const width = parseSize(props.width);
          const height = parseSize(props.height);
          const padding = parseEdgeInsets(props.padding);
          const margin = parseEdgeInsets(props.margin);
          const borderRadius = parsePx(props.borderRadius);
          const backgroundColor = colorToFlutter(props.background);
          const borderColor = colorToFlutter(props.border?.split(' ').at(-1));
          const mainAxis = getMainAxis(props.justifyContent);
          const crossAxis = getCrossAxis(props.alignItems);

          return `${indent}Container(
    width: ${width},
    height: ${height},
    padding: ${padding},
    margin: ${margin},
    decoration: BoxDecoration(
      color: ${backgroundColor},
      borderRadius: BorderRadius.circular(${borderRadius}),
      border: Border.all(color: ${borderColor}),
    ),
    child: Column(
      mainAxisAlignment: ${mainAxis},
      crossAxisAlignment: ${crossAxis},
      children: [
  ${children}
      ],
    ),
  )`;
        }

        default:
          return `${indent}SizedBox.shrink()`;
      }
    };

    return renderNode('ROOT');
  }  
}
