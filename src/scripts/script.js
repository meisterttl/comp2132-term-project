import { chooseWord } from "../api/dictionary";
import { alphabet } from "./constants";

// DOM Variables
const keyboardEl = document.querySelector("#keyboard");

// HTML Output
const buttons = alphabet.map((letter) => {
  const btn = Object.assign(document.createElement("button"), {
    id: letter,
    className: "button",
  });
  btn.setAttribute("type", "button");
  btn.textContent = letter.toUpperCase();

  return btn;
});

keyboardEl.append(...buttons);
