import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { GENDERS } from 'src/common/constants/configuracion';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    type: String,
    description: 'Nombre del usuario',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'John Doe',
    type: String,
    description: 'Apellido del usuario',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  last_name: string;

  @ApiProperty({
    example: 'john@live.com',
    type: String,
    description: 'Correo electrónico del usuario',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    type: String,
    description: 'Contraseña del usuario',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'masculino',
    type: String,
    description: 'Genero del usuario (Opcional)',
  })
  @IsString()
  @IsOptional()
  @IsEnum(GENDERS)
  genero: GENDERS;
}
