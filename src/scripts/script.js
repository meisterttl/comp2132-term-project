import Game from "./Game";
import { chooseWord } from "../api/dictionary";
import { alphabet } from "./constants";

// DOM Variables
const displayEl = document.querySelector("#display");
const guessesEl = document.querySelector("#guesses");
const keyboardEl = document.querySelector("#keyboard");

const startBtn = document.querySelector("#start");

// Variables
const ignoreKeys = [];
const lifeTotal = 6;
let gameStarted = false;
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
function disableAllBtns() {
  const btns = keyboardEl.querySelectorAll("button");
  btns.forEach((btn) => (btn.disabled = true));
}

async function gameStart() {
  gameStarted = true;

  await chooseWord()
    .then((data) => {
      game = new Game(data);
      console.log(game.getWord());
      populateGuessess();
      updateHangman(0);
    })
    .catch((err) => console.log(err));

  keyboardEl.append(...buttons);
  startBtn.parentElement.remove();
}

function handleGuesses(id) {
  let lifeLeft = game.lifeLeft();

  if (0 !== lifeLeft) {
    const list = game.guess(id);

    if (list && Array.isArray(list)) {
      const lettersLeft = game.getLength();

      if (0 !== list.length) {
        const letterBoxes = guessesEl.querySelectorAll(".letter-box");

        list.forEach((pos) => {
          letterBoxes[pos].textContent = id;
          letterBoxes[pos].classList.add("filled");
        });

        if (0 === lettersLeft) disableAllBtns(); // WIN
      } else {
        lifeLeft = game.lifeLeft();

        updateHangman(lifeTotal - lifeLeft);
        if (0 === lifeLeft) disableAllBtns(); // LOSE
      }
    }
  }
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
      });

      wordWrapper.append(letterBox);
      i++;
    }

    guessesEl.append(wordWrapper);
  });
}

function updateHangman(number) {
  const image = displayEl.querySelector("img");
  image.src = `images/hangman_${number}.png`;
}

function keyPressed(e) {
  const key = this.id;

  if (alphabet.includes(key) && !ignoreKeys.includes(key)) {
    keyActive(key);
    keyDeactive(key);
  }
}

function keyDownEvent(e) {
  const key = e.key.toLowerCase();

  if (alphabet.includes(key) && !ignoreKeys.includes(key)) keyActive(key);
}

function keyUpEvent(e) {
  const key = e.key.toLowerCase();

  if (alphabet.includes(key) && !ignoreKeys.includes(key)) keyDeactive(key);
}

function keyActive(id) {
  const btn = keyboardEl.querySelector(`#${id}`);

  if (btn && !btn.classList.contains("active")) btn.classList.add("active");
}

function keyDeactive(id) {
  const btn = keyboardEl.querySelector(`#${id}`);

  if (gameStarted && btn) {
    handleGuesses(id);
    ignoreKeys.push(id);

    btn.disabled = true;
    btn.classList.remove("active");
    btn.removeEventListener("click", keyPressed);
  }
}
