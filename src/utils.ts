export const radians = function (deg: number) {
  return (deg * Math.PI) / 180.0;
};
export const constrain = function (
  n: number,
  low: number,
  high: number
): number {
  return Math.max(Math.min(n, high), low);
};

export const map = function (
  n: number,
  start1: number,
  stop1: number,
  start2: number,
  stop2: number,
  withinBounds?: boolean
) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return this.constrain(newval, start2, stop2);
  } else {
    return this.constrain(newval, stop2, start2);
  }
};

export const random = function (min: number, max?: number) {
  if (arguments.length === 1) {
    min = 0;
    max = arguments[0];
  }
  return Math.random() * (max - min) + min;
};

export const sin = Math.sin;
export const cos = Math.cos;
export const CENTER = "center";
export const PI = Math.PI;
