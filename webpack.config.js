const path = require('path');

module.exports = {
  entry:  './src/borage.js',
  output: {
    path:          path.resolve(__dirname, 'dist'),
    filename:      'borage.js',
    library:       'Borage',
    libraryTarget: 'umd'
  }
};
