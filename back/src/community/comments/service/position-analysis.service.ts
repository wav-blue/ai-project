import { Injectable } from '@nestjs/common';
import { MyLogger } from 'src/logger/logger.service';
import { randomPosition } from '../util/comment.util';
import { AxiosRequestService } from 'src/axios/service/axios-request.service';

@Injectable()
export class PoistionAnalysisService {
  constructor(
    private readonly axiosRequestService: AxiosRequestService,
    private logger: MyLogger,
  ) {
    this.logger.setContext(PoistionAnalysisService.name);
  }
  // 댓글을 생성할 때 postion을 설정
  async analysisPosition(content: string): Promise<string> {
    let position: string;
    try {
      // 응답 시간이 길어지는 것을 방지하기 위해 적당한 길이만 분석
      const substring_string = content.substring(0, 36);
      const body = {
        content: substring_string,
      };

      const response = await this.axiosRequestService.FlaskRequest(body);
      position = response.data.position;

      this.logger.verbose(
        `Flask 서버로의 요청 성공! 분석을 통해 position 결정: ${position}`,
      );
    } catch (err) {
      this.logger.warn(`분석 요청이 실패했습니다. Flask 서버를 확인해주세요!`);
      this.logger.verbose(`랜덤으로 position을 결정합니다...`);
      position = randomPosition();
    }
    return position;
  }
}
