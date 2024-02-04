import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import * as config from 'config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { bytesToBase64 } from '../util/comment.util';

const flaskConfig = config.get('flask');

@Injectable()
export class AxiosRequestService {
  constructor(private readonly httpService: HttpService) {}

  async FlaskRequest(body: { content: string }): Promise<any> {
    // flask 서버로 요청 보낼 body 내용
    const apiUrl =
      `http://${flaskConfig.url}` + ':' + `${flaskConfig.port}` + `/analysis`;

    console.log(`http://${apiUrl}로 Post 요청!`);

    const username = process.env.FLASK_USER_NAME || flaskConfig.username;
    const password = process.env.FLASK_PASSWORD || flaskConfig.password;

    const encodedUsername = bytesToBase64(new TextEncoder().encode(username));
    const encodedPassword = bytesToBase64(new TextEncoder().encode(password));

    const headersRequest = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encodedUsername}:${encodedPassword}`,
    };
    console.log(
      `인증 헤더의 내용: Basic ${encodedUsername}:${encodedPassword}`,
    );

    const flask_response = await firstValueFrom(
      this.httpService
        .post(apiUrl, body, { headers: headersRequest })
        .pipe(map((res) => res))
        .pipe(
          catchError((error: AxiosError) => {
            console.error('Axios Error::', error);
            throw 'Flask Server 에러 발생!';
          }),
        ),
    );
    return flask_response;
  }
}
