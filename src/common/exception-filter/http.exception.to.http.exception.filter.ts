import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

// Exception filters
@Catch(HttpException)
export class ExceptionToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const response = ctx.getResponse();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      path: request.url,
    });
  }
}
