const path = require('path');
const externals = require('./externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const EntryChunkPlugin = require('../plugins/entry-chunk-plugin');

const baseDir = process.cwd();

console.log('base dir', baseDir);

module.exports = {
  entry: {
    main: path.resolve(baseDir, 'entry/src/index.js')
  },
  output: {
    path: path.resolve(baseDir, 'dist/entry'),
    chunkLoadingGlobal: 'webpackJsonp', // todo 目前 EntryChunkPlugin 为硬编码的，后面支持可配置
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: externals,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        // use: ['babel-loader'],
        use: [
          'babel-loader',
          {
            loader: EntryChunkPlugin.loader,
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(baseDir, 'entry/public/index.html'),
      // filename: 'xx.html',
      // chunks: ['vendor', 'common', 'main']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(baseDir, 'entry/public/*.js'),
          to: path.resolve(baseDir, 'dist'),
        },
      ],
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      /*  initial - 入口 chunk，对于异步导入的文件不处理
          async - 异步 chunk，只对异步导入的文件处理
          all - 全部 chunk
      */
      // 缓存分组
      cacheGroups: {
        // 第三方模块
        vendor: {
            name: 'vendor', // chunk 名称
            priority: 1, // 权限更高，优先抽离，重要！！！！
            test: /node_modules/,
            minSize: 0, // 大小限制，太小的也没必要抽出来，可以设成 3KB, 5KB 之类的
            minChunks: 1, // 最少复用过几次
        },
        // 公共模块
        common: {
            name: 'common',
            priority: 0,
            minSize: 0,
            minChunks: 2,
        }
      }
    }
  }
}
