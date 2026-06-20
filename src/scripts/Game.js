class Game {
  #word;
  #wordSpread;
  #length;
  #hint;
  #lives;
  #guesses;

  constructor(word) {
    this.#setWord(word);
    this.#lives = 6;
    this.#guesses = [];
  }

  #addGuess(input) {
    this.#guesses.push(input);
  }

  #lettersLeft(number) {
    this.#length = this.#length - number;
  }

  #loseLife() {
    this.#lives--;
  }

  #setWord(input) {
    const word =
      "string" === typeof input.word && "" !== input.word.trim()
        ? input.word
        : "hippopotomonstrosesquippedaliophobia";
    const letters = word.split("").filter((letter) => " " !== letter);
    const hint =
      "string" === typeof input.hint && "" !== input.hint.trim()
        ? input.hint
        : "The phobia or fear of long words";

    this.#word = word;
    this.#wordSpread = letters;
    this.#length = letters.length;
    this.#hint = hint;
  }

  getHint() {
    return this.#hint;
  }

  getLength() {
    return this.#length;
  }

  getLetters() {
    return this.#wordSpread;
  }

  getWord() {
    return this.#word;
  }

  guess(letter) {
    const lettersLeft = this.getLength();

    if (0 !== lettersLeft) {
      const guesses = this.guessList();

      if (!guesses.includes(letter)) {
        const lifeLeft = this.lifeLeft();

        if (0 !== lifeLeft) {
          const letters = this.getLetters();
          const found = letters
            .map((item, idx) => {
              return item === letter ? idx : undefined;
            })
            .filter((item) => undefined !== item);

          this.#addGuess(letter);
          if (0 === found.length) this.#loseLife();
          else this.#lettersLeft(found.length);

          return found;
        }
      } else {
        console.log("This letter has been already used!");
      }
    }

    return null;
  }

  guessList() {
    return this.#guesses;
  }

  lifeLeft() {
    return this.#lives;
  }

  reset(word) {
    this.#setWord(word);
    this.#lives = 6;
    this.#guesses.length = 0;
  }
}

export default Game;
