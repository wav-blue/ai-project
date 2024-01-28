import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';

// Exception filters
@Catch(HttpException)
export class ExceptionToHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionToHttpExceptionFilter');

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
