import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  winstonLogger = require('./wintonLogger');

  // 파일에 기록되지 않는 내용
  log(message: any, ...optionalParams: [...any, string?]) {
    super.log(`${message}`, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: [...any, string?]) {
    super.verbose(`${message}`, ...optionalParams);
    this.winstonLogger.verbose(`${message}`);
  }
  debug(message: any, ...optionalParams: [...any, string?]) {
    super.debug(`${message}`, ...optionalParams);
    this.winstonLogger.debug(`${message}`);
  }
  // 로그 파일에 기록
  info(message: any, ...optionalParams: [...any, string?]) {
    super.log(`📜 ${message}`, ...optionalParams);
    this.winstonLogger.info(`${message}`);
  }
  warn(message: any, ...optionalParams: [...any, string?]) {
    super.warn(`⚠️  ${message}`, ...optionalParams);
    this.winstonLogger.warn(`${message}`);
  }
  // 로그, 에러 파일에 기록
  error(message: any, ...optionalParams: [...any, string?]) {
    super.error(`⚠️  ${message}`, ...optionalParams);
    this.winstonLogger.error(`${message}`);
  }
}
