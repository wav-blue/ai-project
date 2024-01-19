function parseDateTimeToString(dateString: Date) {
  const year = dateString.getFullYear();
  const month = ('0' + (dateString.getMonth() + 1)).slice(-2);
  const day = ('0' + dateString.getDate()).slice(-2);

  const hour = dateString.getHours();
  const minute = dateString.getMinutes();
  const second = dateString.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export { parseDateTimeToString };
