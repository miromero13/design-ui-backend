import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  Inject,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { Response } from 'express';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import OpenAIApi from 'openai';
import { FileInterceptor } from '@nestjs/platform-express';
import { readFile } from 'fs/promises';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject("OPENAI_CLIENT") private readonly openai: OpenAIApi
  ) { }

  /**
   * 🔧 Endpoint para exportar el proyecto Flutter como archivo ZIP
   */
  @Post('export/flutter')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Exportar proyecto Flutter como ZIP',
    description: 'Recibe un conjunto de pantallas serializadas y devuelve un archivo .zip con el proyecto Flutter listo para ejecutar.',
  })
  @ApiBody({
    description: 'Diccionario de pantallas serializadas como JSON string',
    schema: {
      type: 'object',
      example: {
        "Pantalla 1": "{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{},\"displayName\":\"Container\",\"nodes\":[],\"parent\":null}}",
        "Pantalla 2": "{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{},\"displayName\":\"Container\",\"nodes\":[],\"parent\":null}}"
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo ZIP generado exitosamente (respuesta como archivo)',
  })
  async exportFlutter(
    @Body() pantallas: Record<string, string>,
    @Res() res: Response,
  ) {
    return this.projectsService.exportarProyectoFlutter(pantallas, res);
  }

  @Post("generar-diseno")
  async generarDiseno(@Body() body: { prompt: string }) {
    const prompt = body.prompt;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `
Eres un generador de interfaces para Craft.js.

⚠️ IMPORTANTE:
- Tu única salida debe ser un JSON **serializado** compatible con Craft.js.
- Usa la estructura exacta que genera \`query.serialize()\` en Craft.js.
- La raíz debe tener el ID "ROOT" y usar el componente "Container" con isCanvas: true.
- Define nodos hijos como objetos con claves únicas (ej. "node1", "node2").
- No uses estructuras como "children", ni "components".
- Solo responde el JSON, sin comentarios, ni explicaciones.

Componentes disponibles:
- Container
- Text
- Button
- Input
- Checkbox
- Image
- Table

Ejemplo mínimo:

{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "isCanvas": true,
    "props": { "padding": "16px" },
    "displayName": "Container",
    "nodes": ["node1", "node2"],
    "parent": null,
    "linkedNodes": {}
  },
  "node1": {
    "type": { "resolvedName": "Text" },
    "props": { "text": "Hola Mundo" },
    "displayName": "Text",
    "parent": "ROOT"
  },
  "node2": {
    "type": { "resolvedName": "Button" },
    "props": { "text": "Click aquí" },
    "displayName": "Button",
    "parent": "ROOT"
  }
}
  📦 **Ejemplo real válido** de pantalla:

{
  "Pantalla 1": "{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"display\":\"flex\",\"flexDirection\":\"column\",\"gap\":\"0px\",\"columnGap\":\"\",\"rowGap\":\"\",\"background\":\"#ffffff\",\"width\":\"375px\",\"height\":\"1000px\",\"margin\":\"0\",\"padding\":\"0px\",\"border\":\"0px dashed #ccc\",\"borderRadius\":\"0px\",\"boxShadow\":\"none\",\"alignItems\":\"flex-start\",\"justifyContent\":\"flex-start\"},\"displayName\":\"Container\",\"custom\":{},\"parent\":null,\"hidden\":false,\"nodes\":[\"U-mB7ZKWYg\",\"cXb9huWfTf\",\"Skpfq0P_7a\",\"Wuqb4ZctV-\",\"mWkA4zT5lx\",\"aNpkBOOojw\"],\"linkedNodes\":{}},\"U-mB7ZKWYg\":{\"type\":{\"resolvedName\":\"Text\"},\"isCanvas\":true,\"props\":{\"text\":\"Nuevo texto\",\"fontSize\":16,\"fontFamily\":\"Arial, sans-serif\",\"fontWeight\":\"normal\",\"color\":\"#000000\",\"background\":\"transparent\",\"textAlign\":\"left\",\"margin\":\"0\",\"padding\":\"0\",\"textDecoration\":\"none\",\"lineHeight\":\"normal\",\"letterSpacing\":\"normal\"},\"displayName\":\"Text\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"cXb9huWfTf\":{\"type\":{\"resolvedName\":\"Button\"},\"isCanvas\":true,\"props\":{\"text\":\"Mi Botón\",\"gotoScreen\":\"\",\"background\":\"#0d6efd\",\"color\":\"#ffffff\",\"fontSize\":14,\"padding\":\"8px 16px\",\"margin\":\"0\",\"border\":\"none\",\"borderRadius\":\"4px\",\"boxShadow\":\"none\",\"cursor\":\"pointer\"},\"displayName\":\"Button\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"Wuqb4ZctV-\":{\"type\":{\"resolvedName\":\"Input\"},\"isCanvas\":true,\"props\":{\"placeholder\":\"Ingrese texto...\",\"value\":\"\",\"fontSize\":14,\"color\":\"#000000\",\"background\":\"#ffffff\",\"border\":\"1px solid #ccc\",\"padding\":\"8px\",\"margin\":\"4px 0\",\"borderRadius\":\"4px\"},\"displayName\":\"Input\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"Skpfq0P_7a\":{\"type\":{\"resolvedName\":\"Checkbox\"},\"isCanvas\":true,\"props\":{\"label\":\"Nuevo Checkbox\",\"fontSize\":14,\"color\":\"#000000\",\"background\":\"transparent\",\"border\":\"none\",\"padding\":\"4px\",\"margin\":\"4px 0\",\"borderRadius\":\"4px\"},\"displayName\":\"Checkbox\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"mWkA4zT5lx\":{\"type\":{\"resolvedName\":\"Table\"},\"isCanvas\":false,\"props\":{\"rows\":3,\"columns\":3,\"border\":\"1px solid #ccc\",\"width\":\"100%\",\"height\":\"auto\"},\"displayName\":\"Table\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"aNpkBOOojw\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"display\":\"flex\",\"flexDirection\":\"column\",\"gap\":\"0px\",\"columnGap\":\"\",\"rowGap\":\"\",\"background\":\"#ffffff\",\"width\":\"375px\",\"height\":\"375px\",\"margin\":\"0\",\"padding\":\"0px\",\"border\":\"0px dashed #ccc\",\"borderRadius\":\"0px\",\"boxShadow\":\"none\",\"alignItems\":\"flex-start\",\"justifyContent\":\"flex-start\"},\"displayName\":\"Container\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}"
}

Utiliza de esa forma los estilo, estructura y detalle en todas tus respuestas.
`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });    

    const resultText = response.choices[0].message?.content || "";
    return { success: true, serialized: resultText };
  }

  @Post("generar-diseno-con-imagen")
  @UseInterceptors(FileInterceptor('image'))
  async generarDesdeImagen(
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { prompt?: string }
  ) {
    const prompt = body.prompt || "Genera una interfaz visual basada en esta imagen. Devuelve solo JSON serializado compatible con Craft.js usando Container como raíz.";

    // Convierte la imagen a base64
    const buffer = image.buffer; 
    const base64Image = buffer.toString("base64");

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${prompt}\n
Devuelve directamente un JSON válido de Craft.js como este:

⚠️ IMPORTANTE:
- Tu única salida debe ser un JSON **serializado** compatible con Craft.js.
- Usa la estructura exacta que genera \`query.serialize()\` en Craft.js.
- La raíz debe tener el ID "ROOT" y usar el componente "Container" con isCanvas: true.
- Define nodos hijos como objetos con claves únicas (ej. "node1", "node2").
- No uses estructuras como "children", ni "components".
- Solo responde el JSON, sin comentarios, ni explicaciones.

Componentes disponibles:
- Container
- Text
- Button
- Input
- Checkbox
- Image
- Table

{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "isCanvas": true,
    "props": { "padding": "16px", "background": "#f9f9f9" },
    "displayName": "Container",
    "nodes": ["n1"],
    "parent": null,
    "linkedNodes": {}
  },
  "n1": {
    "type": { "resolvedName": "Text" },
    "props": { "text": "Hola mundo" },
    "displayName": "Text",
    "parent": "ROOT"
  }
}
📦 **Ejemplo real válido** de pantalla:

{
  "Pantalla 1": "{\"ROOT\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"display\":\"flex\",\"flexDirection\":\"column\",\"gap\":\"0px\",\"columnGap\":\"\",\"rowGap\":\"\",\"background\":\"#ffffff\",\"width\":\"375px\",\"height\":\"1000px\",\"margin\":\"0\",\"padding\":\"0px\",\"border\":\"0px dashed #ccc\",\"borderRadius\":\"0px\",\"boxShadow\":\"none\",\"alignItems\":\"flex-start\",\"justifyContent\":\"flex-start\"},\"displayName\":\"Container\",\"custom\":{},\"parent\":null,\"hidden\":false,\"nodes\":[\"U-mB7ZKWYg\",\"cXb9huWfTf\",\"Skpfq0P_7a\",\"Wuqb4ZctV-\",\"mWkA4zT5lx\",\"aNpkBOOojw\"],\"linkedNodes\":{}},\"U-mB7ZKWYg\":{\"type\":{\"resolvedName\":\"Text\"},\"isCanvas\":true,\"props\":{\"text\":\"Nuevo texto\",\"fontSize\":16,\"fontFamily\":\"Arial, sans-serif\",\"fontWeight\":\"normal\",\"color\":\"#000000\",\"background\":\"transparent\",\"textAlign\":\"left\",\"margin\":\"0\",\"padding\":\"0\",\"textDecoration\":\"none\",\"lineHeight\":\"normal\",\"letterSpacing\":\"normal\"},\"displayName\":\"Text\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"cXb9huWfTf\":{\"type\":{\"resolvedName\":\"Button\"},\"isCanvas\":true,\"props\":{\"text\":\"Mi Botón\",\"gotoScreen\":\"\",\"background\":\"#0d6efd\",\"color\":\"#ffffff\",\"fontSize\":14,\"padding\":\"8px 16px\",\"margin\":\"0\",\"border\":\"none\",\"borderRadius\":\"4px\",\"boxShadow\":\"none\",\"cursor\":\"pointer\"},\"displayName\":\"Button\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"Wuqb4ZctV-\":{\"type\":{\"resolvedName\":\"Input\"},\"isCanvas\":true,\"props\":{\"placeholder\":\"Ingrese texto...\",\"value\":\"\",\"fontSize\":14,\"color\":\"#000000\",\"background\":\"#ffffff\",\"border\":\"1px solid #ccc\",\"padding\":\"8px\",\"margin\":\"4px 0\",\"borderRadius\":\"4px\"},\"displayName\":\"Input\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"Skpfq0P_7a\":{\"type\":{\"resolvedName\":\"Checkbox\"},\"isCanvas\":true,\"props\":{\"label\":\"Nuevo Checkbox\",\"fontSize\":14,\"color\":\"#000000\",\"background\":\"transparent\",\"border\":\"none\",\"padding\":\"4px\",\"margin\":\"4px 0\",\"borderRadius\":\"4px\"},\"displayName\":\"Checkbox\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"mWkA4zT5lx\":{\"type\":{\"resolvedName\":\"Table\"},\"isCanvas\":false,\"props\":{\"rows\":3,\"columns\":3,\"border\":\"1px solid #ccc\",\"width\":\"100%\",\"height\":\"auto\"},\"displayName\":\"Table\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}},\"aNpkBOOojw\":{\"type\":{\"resolvedName\":\"Container\"},\"isCanvas\":true,\"props\":{\"display\":\"flex\",\"flexDirection\":\"column\",\"gap\":\"0px\",\"columnGap\":\"\",\"rowGap\":\"\",\"background\":\"#ffffff\",\"width\":\"375px\",\"height\":\"375px\",\"margin\":\"0\",\"padding\":\"0px\",\"border\":\"0px dashed #ccc\",\"borderRadius\":\"0px\",\"boxShadow\":\"none\",\"alignItems\":\"flex-start\",\"justifyContent\":\"flex-start\"},\"displayName\":\"Container\",\"custom\":{},\"parent\":\"ROOT\",\"hidden\":false,\"nodes\":[],\"linkedNodes\":{}}}"
}

Utiliza de esa forma los estilo, estructura y detalle en todas tus respuestas.

🚫 No uses \`\`\`json ni ningún tipo de delimitador. Devuelve solo el JSON en texto plano.

Sin explicaciones ni etiquetas extra.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const result = response.choices[0].message?.content;

    return { success: true, serialized: result };
  }
}
