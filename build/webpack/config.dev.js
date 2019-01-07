'use strict';

const webpack = require('webpack');
const logger = require('../../server/lib/logger');
logger.info('Running development configuration...');

// Override base configuration.
let config = require('./config.base.js');
config.devtool = 'source-map';
config.output.publicPath = 'http://localhost:3001' + config.output.publicPath;

// Stats configuration.
config.stats = {
  colors: true,
  reasons: true
};

// Development modules.
config.module.rules.push({
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    'postcss-loader'
  ],
});

// Webpack plugins.
config.plugins = config.plugins.concat([
  new webpack.HotModuleReplacementPlugin()
]);

module.exports = config;
