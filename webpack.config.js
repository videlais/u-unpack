const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/web/index.ts',
  output: {
    filename: 'u-unpack.bundle.js',
    path: path.resolve(__dirname, 'docs'),
    library: 'UUnpack',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      'fs': false,
      'path': require.resolve('path-browserify'),
      'stream': require.resolve('stream-browserify'),
      'buffer': require.resolve('buffer/'),
    },
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
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/web/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'),
    },
    compress: true,
    port: 8080,
    open: true,
  },
};
