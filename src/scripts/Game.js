class Game {
  #word;
  #lives;
  #guesses;

  constructor(word) {
    this.#setWord(word);
    this.#lives = 6;
    this.#guesses = [];
  }

  guess(letter) {
    const guesses = this.guessList();

    if (!guesses.includes(letter)) {
      const lifeLeft = this.remainingLives();

      if (0 !== lifeLeft) {
        const letters = this.getWord()
          .split("")
          .filter((letter) => " " !== letter);
        const found = letters
          .map((item, idx) => {
            return item === letter ? idx : undefined;
          })
          .filter((item) => undefined !== item);

        if (0 === found.length) this.#loseLife();
        this.#addGuess(letter);
      }
    } else {
      console.log("This letter has been already used!");
    }
  }

  #addGuess(input) {
    this.#guesses.push(input);
  }

  #loseLife() {
    this.#lives--;
  }

  #setWord(input) {
    this.#word =
      "string" === typeof input && "" !== input
        ? input
        : "hippopotomonstrosesquippedaliophobia";
  }

  getWord() {
    return this.#word;
  }

  guessList() {
    return this.#guesses;
  }

  remainingLives() {
    return this.#lives;
  }
}

export default Game;
