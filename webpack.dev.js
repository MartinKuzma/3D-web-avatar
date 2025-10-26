const path = require('path');

module.exports = {  
  entry: './src/main.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: '3DAvatar',
    libraryTarget: 'umd',
    clean: true,
  },

  mode: 'development',
  devtool: 'source-map',
  optimization: {
    minimize: false,
  },

  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 9000,
    open: true,
    openPage: 'debug.html',
  },
};
