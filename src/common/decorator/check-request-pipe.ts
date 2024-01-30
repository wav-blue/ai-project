import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class checkRequestPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    console.log('req 확인 : ', value);
    return value;
  }
}
