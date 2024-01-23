import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Mylogger } from '../logger/mylogger.service';

// Exception filters
@Catch(HttpException)
export class ExceptionToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Mylogger('ExceptionToHttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const response = ctx.getResponse();

    this.logger.error(exception.message);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      path: request.url,
    });
  }
}
