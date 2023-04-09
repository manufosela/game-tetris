import { css } from 'lit';

export const GameTetrisStyles = css`
  :host {
    color: var(--game-tetris-text-color, #fff);
    height: 100%;
    margin: 0;
    padding: 0;
    background: black;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  canvas {
    margin: 0;
    padding: 0;
    border: 1px solid white;
  }

  .espejado {
    transform: scaleX(-1);
    display: inline-block;
  }
`;
