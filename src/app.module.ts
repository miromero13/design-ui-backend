import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceConfig } from './config/data.source';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProvidersModule } from './providers/providers.module';
import { CommonModule } from './common/common.module';
import { SeederModule } from './seeder/seeder.module';
import { ProjectsModule } from './projects/projects.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    MulterModule.register({
      dest: './uploads',
    }),
    ProvidersModule,
    CommonModule,

    UsersModule,
    AuthModule,

    SeederModule,

    ProjectsModule,
  ]
})
export class AppModule { }
