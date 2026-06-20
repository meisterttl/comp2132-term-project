import Game from "./Game";
import { chooseWord } from "../api/dictionary";
import { alphabet } from "./constants";

// DOM Variables
const gameScreenEl = document.querySelector("#game-screen");
const displayEl = document.querySelector("#display");
const guessesEl = document.querySelector("#guesses");
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
  startBtn.addEventListener("click", gameStart);
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
  replayBtn.textContent = "Replay";
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
      updateHangman(0);
      overlayEl.classList.add("hidden");

      console.log(
        "So you decided to cheat instead... okay, here's the answer!",
      );
      console.log(`Answer: ${game.getWord().toUpperCase()}`);
    })
    .catch((err) => console.log(err));

  gameStarted = true;
  startBtn.parentElement.remove();
}

function gameOver(state) {
  const confetti = overlayEl.querySelector(".confetti-wrapper");
  gameStarted = false;
  removeKeyboard();
  createReplayBtn();

  if ("win" === state) {
    if (!confetti) generateConfetti();

    gameScreenEl.classList.add("game-win");
    overlayEl.classList.remove("hidden");
    overlayEl.querySelector("p").textContent = "You Win!";
    overlayEl.querySelector(".confetti-wrapper").classList.remove("hidden");
  } else if ("lose" === state) {
    fillBoxes();
    gameScreenEl.classList.add("game-lose");
  }
}

async function gameReplay() {
  await chooseWord()
    .then((data) => {
      if (game instanceof Game) game.reset(data);

      resetGuesses();
      createKeyboard();
      populateGuessess();
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

  confetti.classList.add("hidden");
  replayBtnWrapper.remove();

  gameStarted = true;
  ignoreKeys.length = 0;

  gameReplay();
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
