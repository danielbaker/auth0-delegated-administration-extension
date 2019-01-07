const path = require('path');
const webpack = require('webpack');

module.exports = {
  //devtool: 'cheap-module-source-map',

  // The application and the vendor libraries.
  entry: {
    'auth0-delegated-admin': path.resolve(__dirname, '../../client/app.jsx')
  },

  // Output directory.
  output: {
    path: path.join(__dirname, '../../dist'),
    filename: 'bundle.js',
    publicPath: '/app/'
  },

  // Module configuration.
  resolve: {
    modules: [
      'node_modules'
    ],
    extensions: [ '.json', '.js', '.jsx' ]
  },

  // Load all modules.
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(png|ttf|svg|jpg|gif)/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }
      },
      {
        test: /\.(woff|woff2|eot)/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000
          }
        }
      }
    ]
  },

  // Default plugins.
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
      Promise: 'bluebird'
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      'process.env': {
        BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
      },
      __CLIENT__: JSON.stringify(true),
      __SERVER__: JSON.stringify(false)
    })
  ]
};
