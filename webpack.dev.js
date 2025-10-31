const path = require('path');

module.exports = {  
  entry: './src/main.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: '3DAvatar',
    libraryTarget: 'umd',
    clean: true,
  },
  resolve: {
      extensions: ['.ts', '.js'], // This tells webpack to resolve these extensions
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        },      
    ],
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
