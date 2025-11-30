const path = require('path');
const { devtool } = require('./webpack.dev');

module.exports = {
  entry: './src/main.ts',

  output: {
    filename: '3davatar.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: '3DAvatar', 
    libraryTarget: 'umd',
    clean: true,
  },
  resolve: {
      extensions: ['.ts', '.js'], // This tells webpack to resolve these extensions
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      alias: {      
        'three': path.resolve('./node_modules/three/build/three.module.js')
      }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              module: "ES6",
              target: "ES6",
            }
          },
        },
        exclude: /node_modules/,
        },      
    ],
  },
  mode: 'production',
  optimization: {
    minimize: true,

  },
  devtool: false,

  
};