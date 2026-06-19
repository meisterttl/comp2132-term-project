export const randomize = (max) => {
  const random = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;

  return Math.floor(random * max);
};
