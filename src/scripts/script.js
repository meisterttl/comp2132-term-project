import Game from "./Game";
import { chooseWord } from "../api/dictionary";
import { alphabet } from "./constants";

// DOM Variables
const displayEl = document.querySelector("#display");
const guessesEl = document.querySelector("#guesses");
const keyboardEl = document.querySelector("#keyboard");

const startBtn = document.querySelector("#start");

// Default Values
let game;

// HTML Output
const buttons = alphabet.map((letter) => {
  const btn = Object.assign(document.createElement("button"), {
    id: letter,
    className: "button",
  });
  btn.setAttribute("type", "button");
  btn.textContent = letter.toUpperCase();
  btn.addEventListener("click", keyPressed);

  return btn;
});

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  startBtn.addEventListener("click", gameStart);
});

window.addEventListener("keyup", keyUpEvent);
window.addEventListener("keydown", keyDownEvent);

// Functions
async function gameStart() {
  await chooseWord()
    .then((data) => {
      game = new Game(data);
      console.log(game.getWord());
      populateGuessess();
    })
    .catch((err) => console.log(err));

  keyboardEl.append(...buttons);
  startBtn.parentElement.remove();
}

function populateGuessess() {
  const words = game.getWord().split(" ");
  words.forEach((word) => {
    const wordWrapper = Object.assign(document.createElement("div"), {
      className: "word-wrapper",
    });
    const wordLength = word.split("").length;
    let i = 0;

    while (i < wordLength) {
      const letterBox = Object.assign(document.createElement("span"), {
        className: "letter-box",
        innerHTML: word[i],
      });

      wordWrapper.append(letterBox);
      i++;
    }

    guessesEl.append(wordWrapper);
    game.guess("a");
  });
}

function keyPressed(e) {}

function keyDownEvent(e) {
  console.log("KeyDown");
}

function keyUpEvent() {
  console.log("KeyUp");
}
