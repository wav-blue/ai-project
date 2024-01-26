import { catchError, firstValueFrom, map } from 'rxjs';
import { bytesToBase64 } from './base64Function';
import { AxiosError } from 'axios';
import * as config from 'config';
import { Mylogger } from 'src/common/logger/mylogger.service';
import { HttpService } from '@nestjs/axios';

const flaskConfig = config.get('flask');

async function flaskRequest(body: any) {
  const logger = new Mylogger(flaskRequest.name);
  let httpService: HttpService;

  console.log('함수 내부');
  const apiUrl = `${flaskConfig.url}:${flaskConfig.port}/analysis`;
  console.log('함수 내부', apiUrl);
  logger.log(
    `http://${flaskConfig.url}:${flaskConfig.port}/analysis`,
    '로 Post 요청!',
  );

  //const username = 'asdsadsadas' || flaskConfig.username;
  const username = process.env.FLASK_USER_NAME || flaskConfig.username;
  const password = process.env.FLASK_PASSWORD || flaskConfig.password;

  const encodedUsername = bytesToBase64(new TextEncoder().encode(username));
  const encodedPassword = bytesToBase64(new TextEncoder().encode(password));

  const headersRequest = {
    'Content-Type': 'application/json',
    Authorization: `Basic ${encodedUsername}:${encodedPassword}`,
  };
  console.log('flask_response 시도 >> ');
  const flask_response = await firstValueFrom(
    this.httpService
      .post(apiUrl, body, { headers: headersRequest })
      .pipe(map((res) => res))
      .pipe(
        catchError((error: AxiosError) => {
          this.logger.error('Axios Error::', error);
          throw 'Flask Server 에러 발생!';
        }),
      ),
  );

  return flask_response;
}

export { flaskRequest };
