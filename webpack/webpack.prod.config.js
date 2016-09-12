var path = require('path');
var webpack = require('webpack');

var configs = require('./webpack.base.config.js');

configs = configs.map(config => {
    config.plugins = config.plugins.concat([
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({ output: { comments: false } })
    ]);
    return config;
});

module.exports = configs;
