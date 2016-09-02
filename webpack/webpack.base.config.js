var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

var path = require('path')
var objectAssign = require('object-assign')

var NODE_ENV = process.env.NODE_ENV;
NODE_ENV = NODE_ENV && NODE_ENV.trim() === 'production' ? 'production' : 'development';

var SELLER = process.env.SELLER;
SELLER = SELLER ? SELLER.trim() : 'default';

module.exports = {
  target: 'web',
  entry: ['babel-polyfill', './src/script/index.tsx', './src/style/main.scss'],
  output: {
    path: path.join(__dirname, '../dist/' + SELLER),
    // publicPath: '',
    //publicPath: '',
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.(c|t)sv$/,
        loaders: ['DataLoader?seller=' + SELLER],
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!sass-loader',
      },
      {
        test: /\.ts(x?)$/,
        include: [
          path.join(__dirname, '../src/script') //important for performance!
        ],
        loaders: ['babel?cacheDirectory=true', 'awesome-typescript-loader?forkChecker=true'],
        // loaders: ['happypack/loader', 'awesome-typescript-loader?useBabel=true&babelOptions=true&forkChecker=true']
      },
      {
        test: /\.jade$/,
        loader: 'jade'
      }
      //   {
      //     test: /\.css$/,
      //     loader: 'style!css'
      //   }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.tsx', '.ts', '.js', '.jsx']
  },
  resolveLoader: {
    modulesDirectories: ['node_modules', 'src/script/loaders']
  },
  plugins: [
    //Typically you'd have plenty of other plugins here as well
    new webpack.DllReferencePlugin({
      context: path.join(__dirname, '../src/script'),
      manifest: require('../.dll/vendor-manifest.json')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"' + NODE_ENV + '"',
      'process.env.SELLER': '"' + SELLER + '"'
    }),
    new HtmlWebpackPlugin({
      inject: NODE_ENV === 'production' ? false : true,
      cache: NODE_ENV === 'production' ? false : true,
      filename: 'index.html',
      template: NODE_ENV === 'production' ? path.join(__dirname, '../src/template.jade') : path.join(__dirname, '../src/index.html'),
      hash: false
    }),
    new AddAssetHtmlPlugin({
      filename: require.resolve('../.dll/vendor.js'),
      publicPath: 'assets',
      outputPath: 'assets',
      hash: false,
      includeSourcemap: NODE_ENV === 'production' ? false : true,
    }),
    // new AddAssetHtmlPlugin({
    //   filename: require.resolve('../node_modules/react-mdl/extra/material.css'),
    //   publicPath: 'assets',
    //   outputPath: 'assets',
    //   hash: false,
    //   includeSourcemap: false,
    //   typeOfAsset: 'css'
    // }),
    new AddAssetHtmlPlugin({
      filename: require.resolve('../node_modules/react-mdl/extra/material.js'),
      publicPath: 'assets',
      outputPath: 'assets',
      hash: false,
      includeSourcemap: false
    })
    // I'm waiting the issue is resolved...
    // https://github.com/amireh/happypack/issues/33
    // new HappyPack({
    //   // loaders is the only required parameter:
    //   loaders: ['react-hot', 'babel'],

    //   // customize as needed, see Configuration below
    // })
  ],
  cache: true
}
