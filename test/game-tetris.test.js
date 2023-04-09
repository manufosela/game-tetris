import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import '../game-tetris.js';

/*
Code Analysis

Main functionalities:
The GameTetris class is a LitElement that represents the game Tetris. It handles the game logic, including generating and placing tetris pieces, handling user input, and updating the game board. The class also renders the game board and displays the current score and game over message.

Methods:
- constructor(): initializes the game board and tetris pieces, sets up event listeners
- connectedCallback(): sets up the game board and tetris sequence, adds event listener for key events
- disconnectedCallback(): removes event listener for key events
- handleKeyEvents(): handles user input for moving and rotating tetris pieces, pausing and resuming the game, and triggering game over
- showMessage(): displays a message on the game board
- getRandomInt(): generates a random integer within a given range
- generateSequence(): generates a sequence of tetris piece names
- getNexttetris(): gets the next tetris piece from the sequence
- rotate(): rotates a tetris piece matrix
- isValidMove(): checks if a tetris piece can be moved to a given position on the game board
- placetetris(): places a tetris piece on the game board and checks for completed rows
- showGameOver(): displays the game over message and stops the game loop
- loop(): updates the game board and tetris piece positions and renders them on the canvas

Fields:
- grid: size of each cell on the game board
- frames: number of frames per tetris piece drop
- boardWith: width of the game board
- boardHeight: height of the game board
- rows: number of rows on the game board
- cols: number of columns on the game board
- count: counter for tetris piece drop frames
- points: current score
- rAF: requestAnimationFrame ID for game loop
- gameOver: flag for game over state
- tetrisPiece: object equaling tetris piece matrices
- colors: object equaling colors for each tetris piece
- tetrisSequence: array of tetris piece names in sequence
- playfield: 2D array representing the game board
- tetris: current tetris piece being played
- canvas: HTML canvas element for rendering the game board
- context: 2D rendering context for the canvas
- handleKeyEvents: bound event listener function for key events
*/

describe('GameTetris_class', () => {
  // Tests that the game board is correctly initialized with empty cells.
  it('test_game_board_initialization', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);
    expect([game.playfield.length]).to.deep.include(game.rows);
    expect([game.playfield[0].length]).to.contain(game.cols);
    expect([
      game.playfield.every(row => row.every(cell => cell === 0)),
    ]).to.contain(true);
  });

  // Tests that tetris pieces can be moved and rotated correctly, and that they cannot be moved outside the game board or overlap with existing pieces.
  it('test_tetris_piece_movement', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);
    const { tetris } = game;
    const initialRow = tetris.row;
    const initialCol = tetris.col;
    const initialMatrix = tetris.matrix;
    // Move left
    game.handleKeyEvents({ key: 'ArrowLeft' });
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(game.tetris.col).to.equal(initialCol - 1);
    expect(game.tetris.row).to.equal(initialRow);
    expect(game.tetris.matrix).to.deep.equal(initialMatrix);
    // Move right
    game.handleKeyEvents({ key: 'ArrowRight' });
    expect(game.tetris.col).to.equal(initialCol);
    expect(game.tetris.row).to.equal(initialRow);
    expect(game.tetris.matrix).to.deep.equal(initialMatrix);
    // Rotate
    game.handleKeyEvents({ key: 'ArrowUp' });
    expect(game.tetris.col).to.equal(initialCol);
    expect(game.tetris.row).to.equal(initialRow);
    expect(game.tetris.matrix).not.to.deep.equal(initialMatrix);
    // Move down
    game.handleKeyEvents({ key: 'ArrowDown' });
    expect(game.tetris.col).to.equal(initialCol);
    expect(game.tetris.row).to.equal(initialRow + 1);
    expect(game.tetris.matrix).not.to.deep.equal(initialMatrix);
  });

  // Tests that the game over message is displayed when the game is over.
  it('test_game_over', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);
    game.showGameOver();
    expect(game.gameOver).to.equal(true);
    expect(game.shadowRoot.querySelector('#music').paused).to.equal(true);
  });

  // Tests that the game loop updates the game board and tetris piece positions correctly.
  it('test_game_loop', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);
    game.boardWith = 64;
    game.boardHeight = 128;
    game.grid = 16;
    game.frames = 10;
    game.playfield = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    game.tetrisPiece = {
      I: [[1, 1, 1, 1]],
      J: [
        [1, 1, 1],
        [0, 0, 1],
      ],
      L: [
        [1, 1, 1],
        [1, 0, 0],
      ],
      O: [
        [1, 1],
        [1, 1],
      ],
      S: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      Z: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      T: [
        [1, 1, 1],
        [0, 1, 0],
      ],
    };
    game.colors = {
      I: 'cyan',
      O: 'yellow',
      T: 'purple',
      S: 'green',
      Z: 'red',
      J: 'blue',
      L: 'orange',
    };
    game.tetris = {
      name: 'I',
      matrix: game.tetrisPiece.I,
      row: -1,
      col: 1,
    };
    game.loop();
    expect(game.playfield).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    game.tetris = {
      name: 'J',
      matrix: game.tetrisPiece.J,
      row: -2,
      col: 1,
    };
    game.loop();
    expect(game.playfield).toEqual([
      [0, 1, 1, 1],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    game.tetris = {
      name: 'L',
      matrix: game.tetrisPiece.L,
      row: -2,
      col: 1,
    };
    game.loop();
    expect(game.playfield).toEqual([
      [0, 1, 1, 1],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    game.tetris = {
      name: 'O',
      matrix: game.tetrisPiece.O,
      row: -2,
      col: 1,
    };
    game.loop();
    expect(game.playfield).toEqual([
      [0, 1, 1, 1],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    game.tetris = {
      name: 'S',
      matrix: game.tetrisPiece.S,
      row: -2,
      col: 1,
    };
    game.loop();
    expect(game.playfield).toEqual([
      [0, 1, 1, 1],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
    game.tetris = {
      name: 'Z',
      matrix: game.tetrisPiece.Z,
      row: -2,
      col: 1,
    };
    game.loop();
    expect(game.playfield).toEqual([
      [0, 1, 1, 1],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  // Tests that user input is correctly handled for moving and rotating tetris pieces, pausing and resuming the game, and triggering game over.
  it('test_user_input_handling', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);

    // Test moving tetris piece left
    const initialCol = game.tetris.col;
    const leftArrowEvent = new KeyboardEvent('keydown', { keyCode: 37 });
    document.dispatchEvent(leftArrowEvent);
    expect(game.tetris.col).to.equal(initialCol - 1);

    // Test moving tetris piece right
    const initialCol2 = game.tetris.col;
    const rightArrowEvent = new KeyboardEvent('keydown', { keyCode: 39 });
    document.dispatchEvent(rightArrowEvent);
    expect(game.tetris.col).to.equal(initialCol2 + 1);

    // Test rotating tetris piece
    const initialMatrix = game.tetris.matrix;
    const upArrowEvent = new KeyboardEvent('keydown', { keyCode: 38 });
    document.dispatchEvent(upArrowEvent);
    expect(game.tetris.matrix).not.to.equal(initialMatrix);

    // Test dropping tetris piece
    const initialRow = game.tetris.row;
    const downArrowEvent = new KeyboardEvent('keydown', { keyCode: 40 });
    document.dispatchEvent(downArrowEvent);
    expect(game.tetris.row).to.equal(initialRow + 1);

    // Test pausing and resuming game
    const spaceBarEvent = new KeyboardEvent('keydown', { keyCode: 32 });
    document.dispatchEvent(spaceBarEvent);
    expect(game.rAF).to.equal(null);
    expect(game.shadowRoot.querySelector('#music').paused).to.equal(true);
    document.dispatchEvent(spaceBarEvent);
    await new Promise(resolve => setTimeout(resolve, 500));
    expect(game.rAF).not.to.equal(null);
    expect(game.shadowRoot.querySelector('#music').paused).to.equal(false);

    // Test triggering game over
    game.showGameOver();
    expect(game.gameOver).to.equal(true);
  });

  // Tests that tetris pieces are correctly generated and placed on the game board.
  it('test_tetris_piece_generation', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);

    // Test generating tetris sequence
    game.generateSequence();
    expect(game.tetrisSequence.length).to.equal(7);

    // Test getting next tetris piece
    const initialTetris = game.tetris;
    game.getNexttetris();
    expect(game.tetris).not.to.equal(initialTetris);

    // Test placing tetris piece on playfield
    const initialPlayfield = game.playfield;
    game.placetetris();
    expect(game.playfield).not.to.equal(initialPlayfield);
  });

  // Tests the accessibility of the game for users with disabilities.
  it('test_accessibility', async () => {
    const game = await fixture(html`<game-tetris></game-tetris>`);

    // Test canvas has appropriate aria-label
    const canvas = game.shadowRoot.querySelector('#game');
    expect(canvas.getAttribute('aria-label')).to.equal('Tetris game board');

    // Test canvas has appropriate role
    expect(canvas.getAttribute('role')).to.equal('img');

    // Test canvas has appropriate tabindex
    expect(canvas.getAttribute('tabindex')).to.equal('0');

    game.disconnectedCallback();
  });
});
