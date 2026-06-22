import { randomize } from "../scripts/helpers";

export const chooseWord = async () => {
  const res = await fetch("./api/database.json");
  const data = await res.json();

  if (Array.isArray(data) && 0 !== data.length) {
    const idx = randomize(data.length - 1);

    return data[idx];
  }

  return null;
};
