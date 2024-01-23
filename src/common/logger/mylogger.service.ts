import { ConsoleLogger } from '@nestjs/common';

export class MyloggerService extends ConsoleLogger {
  error(message: any, ...optionalParams: [...any, string?]) {
    super.error(`${message}...`, ...optionalParams);
    this.doSomething();
  }

  private doSomething() {}
}
