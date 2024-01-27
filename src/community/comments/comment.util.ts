import { CommentPosition } from './enum/CommentPosition.enum';

// 랜덤으로 Position 결정
function randomPosition(): CommentPosition {
  let position = CommentPosition.POSITIVE;
  const random_number = Math.random();
  if (random_number < 0.5) {
    position = CommentPosition.NEGATIVE;
  }
  return position;
}

function bytesToBase64(bytes: Uint8Array): string {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

export { randomPosition, bytesToBase64 };
