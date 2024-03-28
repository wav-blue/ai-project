import { Module } from '@nestjs/common';
import { AxiosRequestService } from './service/axios-request.service';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [HttpModule, LoggerModule],
  providers: [AxiosRequestService],
  exports: [AxiosRequestService],
})
export class AxiosModule {}
