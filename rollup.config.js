import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/GameTetris.js',
  output: {
    file: 'dist/game-tetris.min.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [nodeResolve(), terser()],
};
