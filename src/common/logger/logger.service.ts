import { ConsoleLogger } from '@nestjs/common';

export class MyLogger extends ConsoleLogger {
  winstonLogger = require('./wintonLogger');

  // 일반 로그
  log(message: any, ...optionalParams: [...any, string?]) {
    super.log(`${message}`, ...optionalParams);
    this.winstonLogger.info(`${message}`);
  }
  // 실제 에러 메시지를 출력
  error(message: any, ...optionalParams: [...any, string?]) {
    super.error(`${message}`, ...optionalParams);
    this.winstonLogger.error(`${message}`);
  }
  // 경고성 메시지를 출력
  warn(message: any, ...optionalParams: [...any, string?]) {
    super.warn(`⚠️  ${message}`, ...optionalParams);
    this.winstonLogger.warn(`${message}`);
  }
  // 상세한 로그를 출력
  verbose(message: any, ...optionalParams: [...any, string?]) {
    super.verbose(`📜 ${message}`, ...optionalParams);
    this.winstonLogger.verbose(`${message}`);
  }
  // 디버그를 위한 메시지를 출력
  debug(message: any, ...optionalParams: [...any, string?]) {
    super.debug(`🔧 ${message}`, ...optionalParams);
    this.winstonLogger.debug(`${message}`);
  }
}
