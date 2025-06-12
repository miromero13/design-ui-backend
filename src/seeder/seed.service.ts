import { Injectable, Logger } from '@nestjs/common';

import { handlerError } from '../common/utils';
import { ROLES } from 'src/common/constants';
import { GENDERS } from 'src/common/constants/configuracion';
import { UserService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeederService');
  private readonly configService: ConfigService;

  // Asegúrate de inyectar ConfigService en el constructor
  constructor(
    private readonly userService: UserService,
    configService: ConfigService,  // Inyección de ConfigService
  ) {
    this.configService = configService; // Inicialización de la propiedad
  }

  public async runSeeders() {
    // Ahora puedes usar this.configService sin problemas
    if (this.configService.get('APP_PROD') === true)
      return { message: 'No se puede ejecutar seeders en producción' };

    try {
      const user2: CreateUserDto = {
        name: 'Maria',
        last_name: 'Romero',
        email: 'maria@gmail.com',
        password: '123456789',
        genero: GENDERS.FEMENINO,
      };
      await this.userService.createUser(user2);

      return { message: 'Seeders ejecutados correctamente' };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }
}
