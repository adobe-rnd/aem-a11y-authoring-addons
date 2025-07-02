const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GasPlugin = require('gas-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/Code.js',
  output: {
    filename: 'Code.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  plugins: [
    new GasPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/appsscript.json', to: 'appsscript.json' },
      ],
    }),
  ],
  devtool: false,
}; 