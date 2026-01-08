export const toTimestamp = (value: string | undefined) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};
