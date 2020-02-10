const path = require('path');

const MAIN_SRC_DIR = path.resolve(__dirname, `src`);
const NODE_MODULES_DIR = path.resolve(__dirname, `node_modules`);

module.exports = {
  entry: `${MAIN_SRC_DIR}/index.js`,
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'verifier-node.js'
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: [MAIN_SRC_DIR, NODE_MODULES_DIR]
  },
  target: 'node',
  externals: ['bufferutil', 'canvas']
};
