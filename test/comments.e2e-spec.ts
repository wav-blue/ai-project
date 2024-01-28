import * as request from 'supertest';
import { Test } from '@nestjs/testing';
// import { CatsModule } from '../../src/cats/cats.module';
// import { CatsService } from '../../src/cats/cats.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CommunityModule } from '../src/community/community.module';
import { CommentsReadService } from '../src/community/comments/comments-read.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/community/boards/boards.entity';
import { HttpModule } from '@nestjs/axios';
import { typeORMConfig } from 'src/configs/typeorm.config';

describe('Comments', () => {
  let app: INestApplication;
  let commentsService = { findAll: () => ['test'] };
  let commentsReadService = { findAll: () => ['test'] };

  // 제대로 조회 안되는 문제 있음
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        HttpModule,
        TypeOrmModule.forRoot(typeORMConfig),
        TypeOrmModule.forFeature([Board]),
      ],
    })
      .overrideProvider(CommentsReadService)
      .useValue(commentsReadService)
      .compile();

    app = module.createNestApplication();
    await app.listen(5001);
    app.setGlobalPrefix('/api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it(`/GET All Comments`, () => {
    const req = request(app.getHttpServer())
      .get('/api/comments')
      .set('Content-Type', 'application/json');
    console.log('req 확인 :: \n', req);
    // Test {
    //     _events: [Object: null prototype] {
    //       end: [Function: bound onceWrapper] { listener: [Function: bound ] }
    //     },

    // method: 'GET',
    // url: 'http://127.0.0.1:5001/api/comments',
    // _header: { 'content-type': 'application/json' },
    // header: { 'Content-Type': 'application/json' },
    return req.expect(200).expect({
      data: commentsReadService.findAll(),
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve));
  });
});
