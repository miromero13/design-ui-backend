import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, MinLength } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project Name',
    type: String,
    description: 'Nombre del proyecto',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: '{ "key": "value" }',
    type: String,
    description: 'JSON con los datos del proyecto',
  })
  @IsNotEmpty()
  @IsString()
  data: string

  @ApiProperty({
    example: 'userId',
    type: String,
    description: 'ID del usuario',
  })
  @IsNotEmpty()
  @IsUUID()
  userId: string
}
