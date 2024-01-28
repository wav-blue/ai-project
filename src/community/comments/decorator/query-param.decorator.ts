import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QuerySetPage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    let { page, limit } = request.query;
    // query 값 없을 시 기본 값
    if (!limit) limit = 15;
    if (!page) page = 1;

    return { page, limit };
  },
);
