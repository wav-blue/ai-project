import * as dayjs from 'dayjs';

// DTO의 날짜 관련 컬럼을 설정
function setTimeColumn(dto: any) {
  const day = dayjs();

  dto.createdAt = day.format();
  dto.updatedAt = day.format();
  dto.deletedAt = null;

  return dto;
}

export { setTimeColumn };
