import Game from "./Game";
import { chooseWord } from "../api/dictionary";
import { alphabet } from "./constants";

// DOM Variables
const gameScreenEl = document.querySelector("#game-screen");
const displayEl = document.querySelector("#display");
const guessesEl = document.querySelector("#guesses");
const hintEl = document.querySelector("#hint");
const detailsEl = hintEl.querySelector("details");
const keyboardEl = document.querySelector("#keyboard");
const overlayEl = document.querySelector(".overlay");

const startBtn = document.querySelector("#start");

// Variables
const ignoreKeys = [];
const lifeTotal = 6;
const confettiCount = 150;
let gameStarted = false;
let game;

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  startBtn.addEventListener("click", handleStart);
});

window.addEventListener("keyup", keyUpEvent);
window.addEventListener("keydown", keyDownEvent);

// Functions
function createKeyboard() {
  const buttons = alphabet.map((letter) => {
    const btn = Object.assign(document.createElement("button"), {
      id: letter,
      className: "button",
    });
    btn.textContent = letter.toUpperCase();
    btn.setAttribute("type", "button");
    btn.addEventListener("click", keyPressed);

    return btn;
  });

  keyboardEl.append(...buttons);
}

function createReplayBtn() {
  const replayBtnWrapper = Object.assign(document.createElement("div"), {
    className: "menu replay",
  });
  const replayBtn = Object.assign(document.createElement("button"), {
    id: "replay",
    className: "button large",
  });
  replayBtn.textContent = "Play Again";
  replayBtn.setAttribute("type", "button");
  replayBtn.addEventListener("click", handleReplay);

  replayBtnWrapper.append(replayBtn);
  overlayEl.append(replayBtnWrapper);
}

function fillBoxes() {
  const letterBoxes = guessesEl.querySelectorAll(".letter-box");
  const letters = game.getLetters();

  letterBoxes.forEach((box, idx) => {
    if (!box.classList.contains("filled")) {
      box.classList.add("fail");
      box.textContent = letters[idx];
    }
  });
}

async function gameStart() {
  await chooseWord()
    .then((data) => {
      if (!(game instanceof Game)) game = new Game(data);

      createKeyboard();
      populateGuessess();
      hideHint();
      updateHangman(0);
      overlayEl.classList.add("hidden");

      console.log(
        "So you decided to cheat instead... okay, here's the answer!",
      );
      console.log(`Answer: ${game.getWord().toUpperCase()}`);
    })
    .catch((err) => console.log(err));
}

function gameOver(state) {
  let confetti = overlayEl.querySelector(".confetti-wrapper");
  const menuTextEl = overlayEl.querySelector("p");

  gameStarted = false;
  removeKeyboard();
  createReplayBtn();

  if ("win" === state) {
    if (!confetti) confetti = generateConfetti();

    confetti.classList.remove("hidden");
    menuTextEl.textContent = "You Win! 😁";
  } else if ("lose" === state) {
    fillBoxes();

    menuTextEl.textContent = `You Lose! 😵\r\n`;
    menuTextEl.textContent += ` (Answer: ${game.getWord()})`;
  }

  overlayEl.classList.remove("hidden");
  hintEl.classList.add("hidden");
}

async function gameReplay() {
  await chooseWord()
    .then((data) => {
      if (game instanceof Game) game.reset(data);

      resetGuesses();
      createKeyboard();
      populateGuessess();
      hideHint();
      updateHangman(0);
      overlayEl.classList.add("hidden");

      console.log(`Answer: ${game.getWord().toUpperCase()}`);
    })
    .catch((err) => console.log(err));
}

function generateConfetti() {
  const confettiWrapper = Object.assign(document.createElement("div"), {
    className: "confetti-wrapper hidden",
  });
  let i = 0;

  while (i < confettiCount) {
    const confetti = Object.assign(document.createElement("div"), {
      className: `confetti-${i}`,
    });
    confettiWrapper.append(confetti);
    i++;
  }

  overlayEl.append(confettiWrapper);

  return confettiWrapper;
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

        if (0 === lettersLeft) gameOver("win");
      } else {
        lifeLeft = game.lifeLeft();
        updateHangman(lifeTotal - lifeLeft);

        gameScreenEl.classList.add("wrong-guess");

        setTimeout(() => {
          gameScreenEl.classList.remove("wrong-guess");
        }, 100);

        if (0 === lifeLeft) gameOver("lose");
      }
    }
  }
}

function handleReplay(e) {
  const replayBtnWrapper = e.currentTarget.parentElement;
  const confetti = overlayEl.querySelector(".confetti-wrapper");

  gameReplay();

  if (confetti) confetti.classList.add("hidden");
  replayBtnWrapper.remove();

  gameStarted = true;
  ignoreKeys.length = 0;
  hintEl.classList.remove("hidden");
}

function handleStart() {
  gameStart();

  gameStarted = true;
  hintEl.classList.remove("hidden");
  startBtn.parentElement.remove();
}

function hideHint() {
  const hintDiv = hintEl.querySelector("div");
  const hintContainer = hintDiv ? hintDiv : document.createElement("div");
  hintContainer.textContent = game.getHint();

  detailsEl.removeAttribute("open");
  detailsEl.append(hintContainer);
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

function removeKeyboard() {
  keyboardEl.textContent = "";
}

function resetGuesses() {
  guessesEl.textContent = "";
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
