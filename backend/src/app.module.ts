import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ManagerModule } from './Manager/Manager.Module';
import { AdminModule } from './Admin/admin.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ManagerModule,
    AdminModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'fahim123',
      database: 'LifeConnect',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
