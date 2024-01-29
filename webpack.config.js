import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';

// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// import path from 'node:path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// import path from 'node:path';

// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import { fileURLToPath } from 'url';
// import MiniCssExtractPlugin from 'mini-css-extract-plugin';

//import path from 'path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import { fileURLToPath } from 'url';

const isProduction = process.env.NODE_ENV === 'production';

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
    ],
  },
};

export default () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
