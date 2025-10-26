const path = require('path');

module.exports = {
  entry: './src/main.js',

  output: {
    filename: '3davatar.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: '3DAvatar', 
    libraryTarget: 'umd',
  },

  optimization: {
    minimize: true,
  },
  
  mode: 'production', 
};