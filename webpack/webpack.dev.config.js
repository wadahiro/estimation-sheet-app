var path = require('path')
var webpack = require('webpack')

var configs = require('./webpack.base.config.js')

configs = configs.map(config => {
  config.cache = true
  config.devtool = 'source-map'

  config.plugins = config.plugins.concat([
    new webpack.NoErrorsPlugin()
  ])
  return config;
});

module.exports = configs
