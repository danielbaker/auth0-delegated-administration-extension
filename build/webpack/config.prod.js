'use strict';

const webpack = require('webpack');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const project = require('../../package.json');
const logger = require('../../server/lib/logger');
logger.info('Running production configuration...');

const config = require('./config.base.js');
config.profile = false;

// Build output, which includes the hash.
config.output.filename = '[name].ui.' + project.version + '.js';

// Development modules.
config.module.rules.push({
  test: /\.css$/,
  exclude: [/node_modules/],
  use: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'postcss-loader'
  ],
});

config.module.rules.push({
  test: /node_modules.*\.css$/,
  use: [
    'style-loader',
    'css-loader',
    'postcss-loader'
  ],
});

config.optimization = {
  splitChunks: {
    cacheGroups: {
      vendors: {
        chunks: 'all',
        enforce: true,
        filename: 'auth0-delegated-admin.ui.vendors.' + project.version + '.js',
        name: 'vendors',
        test: /node_modules/
      }
    }
  }
};

// Webpack plugins.
config.plugins = config.plugins.concat([
  // Extract CSS to a different file, will require additional configuration.
  new MiniCssExtractPlugin({
    filename: '[name].ui.' + project.version + '.css'
  }),

  // Alternative to StatsWriterPlugin.
  new StatsWriterPlugin({
    filename: 'manifest.json',
    transform: function transformData(data) {
      const chunks = {
        app: data.assetsByChunkName['auth0-delegated-admin'][1],
        style: data.assetsByChunkName['auth0-delegated-admin'][0],
        vendors: data.assetsByChunkName.vendors
      };
      return JSON.stringify(chunks);
    }
  })
]);

module.exports = config;
