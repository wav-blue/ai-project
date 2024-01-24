function randomPosition() {
  let position = 'positive';
  const random_number = Math.random();
  console.log('random: ', random_number);
  if (random_number < 0.5) {
    position = 'negative';
  }
  return position;
}

export { randomPosition };
