import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AxiosRequestService } from 'src/axios/service/axios-request.service';
import { CommentPosition } from './comments/enum/commentPosition.enum';
import { UpdateCommentService } from './comments/service/updateComment.service';

// Consumer
@Processor('analysis')
export class AnalysisConsumer extends WorkerHost {
  private readonly logger = new Logger(AnalysisConsumer.name);
  constructor(
    private readonly axiosRequestService: AxiosRequestService,
    private readonly updateCommentService: UpdateCommentService,
  ) {
    super();
  }

  async process(
    job: Job<{ commentId: number; content: string }>,
  ): Promise<any> {
    this.logger.debug(`${job.id}번 작업 처리`);

    const commentId = job.data.commentId;
    const content = job.data.content;
    // 200자까지만 분석
    const substring_string = content.substring(0, 200);
    const body = {
      content: substring_string,
    };

    let position: CommentPosition;
    try {
      this.logger.debug('Flask 서버로의 요청 시작...');
      const response = await this.axiosRequestService.FlaskRequest(body);

      if (response.data.position == 'positive') {
        position = CommentPosition.POSITIVE;
      } else {
        position = CommentPosition.NEGATIVE;
      }

      this.logger.debug(
        `Flask 서버로의 요청 성공! 분석을 통해 position 결정: ${position}`,
      );

      await this.updateCommentService.updateCommentPostion(commentId, position);
      this.logger.debug('completed');
    } catch (err) {
      this.logger.debug('ERROR');
    }
  }
}
