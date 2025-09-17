import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PusherBeamsService } from './pusher-beams.service';

@Module({
  imports: [ConfigModule],
  providers: [PusherBeamsService],
  exports: [PusherBeamsService],
})
export class PusherModule {}