import { Injectable } from '@nestjs/common';
import { MyLogger } from 'src/logger/logger.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

// Producers
@Injectable()
export class AnalysisService {
  constructor(
    private logger: MyLogger,
    @InjectQueue('analysis') private readonly analysisQueue: Queue,
  ) {
    this.logger.setContext(AnalysisService.name);
  }

  async addJob(content: string): Promise<any> {
    const job = await this.analysisQueue.add('comment-analysis', {
      content,
    });
    return job.id;
  }
}
