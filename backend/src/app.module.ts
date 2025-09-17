import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManagerModule } from './Manager/Manager.Module';
import { AdminModule } from './Admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as dotenv from 'dotenv';
dotenv.config();
import { DonorModule } from './Donor/donor.module';

@Module({
  imports: [
    ManagerModule,
    AdminModule,
    DonorModule,

    TypeOrmModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: (process.env.DB_TYPE as any) || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'LifeConnect',
      autoLoadEntities: true,
      synchronize: true,


      // ssl: {
      //   rejectUnauthorized: false,
      // },
      // extra: {
      //   // Force IPv4 resolution
      //   dnsLookup: (hostname, options, callback) =>
      //     // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-member-access
      //     require('dns').lookup(hostname, { ...options, family: 4 }, callback),
      // },

    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
