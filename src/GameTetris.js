import { html, LitElement } from 'lit';
import { GameTetrisStyles } from './game-tetris-styles.js';
import { GameTetrisMusic } from './game-tetris-music.js';

export class GameTetris extends LitElement {
  static get styles() {
    return [GameTetrisStyles];
  }

  static get properties() {
    return {
      title: { type: String },
      counter: { type: Number },
    };
  }

  constructor() {
    super();
    this.grid = 32;
    this.frames = 35;
    this.boardWith = 320;
    this.boardHeight = 640;
    this.rows = this.boardHeight / this.grid;
    this.cols = this.boardWith / this.grid;

    this.count = 0;
    this.points = 0;
    this.rAF = null; // keep track of the animation frame so we can cancel it
    this.gameOver = false;
    this.tetrisPiece = {
      I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      O: [
        [1, 1],
        [1, 1],
      ],
      S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
    };
    this.colors = {
      I: 'cyan',
      O: 'yellow',
      T: 'purple',
      S: 'green',
      Z: 'red',
      J: 'blue',
      L: 'orange',
    };
    this.handleKeyEvents = this.handleKeyEvents.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.tetrisSequence = [];
    this.playfield = [];
    // populate the empty state
    for (let row = -2; row < this.rows; row += 1) {
      this.playfield[row] = [];
      for (let col = 0; col < this.cols; col += 1) {
        this.playfield[row][col] = 0;
      }
    }

    this.tetris = this.getNexttetris();

    document.addEventListener('keydown', this.handleKeyEvents);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeyEvents);
  }

  handleKeyEvents(e) {
    if (this.gameOver) return;
    // left and right arrow keys (move)
    if (e.which === 37 || e.which === 39) {
      const col = e.which === 37 ? this.tetris.col - 1 : this.tetris.col + 1;
      if (this.isValidMove(this.tetris.matrix, this.tetris.row, col)) {
        this.tetris.col = col;
      }
    }
    // up arrow key (rotate)
    if (e.which === 38) {
      const matrix = GameTetris.rotate(this.tetris.matrix);
      if (this.isValidMove(matrix, this.tetris.row, this.tetris.col)) {
        this.tetris.matrix = matrix;
      }
    }
    // down arrow key (drop)
    if (e.which === 40) {
      const row = this.tetris.row + 1;
      if (!this.isValidMove(this.tetris.matrix, row, this.tetris.col)) {
        this.tetris.row = row - 1;
        this.placetetris();
        return;
      }
      this.tetris.row = row;
    }
    // space key (pause)
    if (e.which === 32) {
      if (this.rAF) {
        cancelAnimationFrame(this.rAF);
        this.rAF = null;
        this.shadowRoot.querySelector('#music').pause();
      } else {
        this.rAF = requestAnimationFrame(this.loop.bind(this));
        this.shadowRoot.querySelector('#music').play();
      }
    }
  }

  showMessage(message) {
    this.context.fillText(
      message,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  static getRandomInt(_min, _max) {
    const min = Math.ceil(_min);
    const max = Math.floor(_max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
      const rand = GameTetris.getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      this.tetrisSequence.push(name);
    }
  }

  getNexttetris() {
    if (this.tetrisSequence.length === 0) {
      this.generateSequence();
    }
    const name = this.tetrisSequence.pop();
    const matrix = this.tetrisPiece[name];
    // I and O start centered, all others start in left-middle
    const col = this.playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    // I starts on row 21 (-1), all others start on row 22 (-2)
    const row = name === 'I' ? -1 : -2;
    return {
      name,
      matrix,
      row,
      col,
    };
  }

  static rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
    return result;
  }

  isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row += 1) {
      for (let col = 0; col < matrix[row].length; col += 1) {
        if (
          matrix[row][col] &&
          (cellCol + col < 0 ||
            cellCol + col >= this.playfield[0].length ||
            cellRow + row >= this.playfield.length ||
            this.playfield[cellRow + row][cellCol + col])
        ) {
          return false;
        }
      }
    }
    return true;
  }

  placetetris() {
    for (let row = 0; row < this.tetris.matrix.length; row += 1) {
      for (let col = 0; col < this.tetris.matrix[row].length; col += 1) {
        if (this.tetris.matrix[row][col]) {
          if (this.tetris.row + row < 0) {
            return this.showGameOver();
          }
          this.playfield[this.tetris.row + row][this.tetris.col + col] =
            this.tetris.name;
        }
      }
    }
    for (let row = this.playfield.length - 1; row >= 0; ) {
      if (this.playfield[row].every(cell => !!cell)) {
        for (let r = row; r >= 0; r -= 1) {
          for (let c = 0; c < this.playfield[r].length; c += 1) {
            this.playfield[r][c] = this.playfield[r - 1][c];
          }
        }
      } else {
        row -= 1;
      }
    }
    this.tetris = this.getNexttetris();
    return true;
  }

  showGameOver() {
    cancelAnimationFrame(this.rAF);
    this.gameOver = true;
    this.context.fillStyle = 'black';
    this.context.globalAlpha = 0.75;
    this.context.fillRect(
      0,
      this.canvas.height / 2 - 30,
      this.canvas.width,
      60
    );
    this.context.globalAlpha = 1;
    this.context.fillStyle = 'white';
    this.context.font = '36px monospace';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.showMessage('¡¡GAME OVER!!');
    this.shadowRoot.querySelector('#music').pause();
  }

  loop() {
    this.rAF = requestAnimationFrame(this.loop.bind(this));
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // draw the playfield
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (this.playfield[row][col]) {
          const name = this.playfield[row][col];
          this.context.fillStyle = this.colors[name];
          this.context.fillRect(
            col * this.grid,
            row * this.grid,
            this.grid - 1,
            this.grid - 1
          );
        }
      }
    }
    if (this.tetris) {
      // eslint-disable-next-line no-plusplus
      if (++this.count > this.frames) {
        this.tetris.row += 1;
        this.count = 0;
        // place piece if it runs into anything
        if (
          !this.isValidMove(
            this.tetris.matrix,
            this.tetris.row,
            this.tetris.col
          )
        ) {
          this.tetris.row -= 1;
          this.placetetris();
        }
      }
      this.context.fillStyle = this.colors[this.tetris.name];
      for (let row = 0; row < this.tetris.matrix.length; row += 1) {
        for (let col = 0; col < this.tetris.matrix[row].length; col += 1) {
          if (this.tetris.matrix[row][col]) {
            // drawing 1 px smaller than the grid creates a grid effect
            this.context.fillRect(
              (this.tetris.col + col) * this.grid,
              (this.tetris.row + row) * this.grid,
              this.grid - 1,
              this.grid - 1
            );
          }
        }
      }
    }
  }

  firstUpdated() {
    this.canvas = this.shadowRoot.querySelector('#game');
    this.context = this.canvas.getContext('2d');
    // start the game
    this.rAF = requestAnimationFrame(this.loop.bind(this));
  }

  render() {
    return html`
      <h1>T<span class="espejado">E</span>TRIS</h1>
      <canvas
        width="${this.boardWith}"
        height="${this.boardHeight}"
        id="game"
      ></canvas>
      <audio id="music" autoplay loop>
        <source src="${GameTetrisMusic}" />
      </audio>
    `;
  }
}
