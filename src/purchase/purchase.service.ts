import { Injectable } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class PurchaseService {
  constructor(private dataSource: DataSource) {}
}
