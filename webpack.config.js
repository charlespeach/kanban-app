var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var Clean = require('clean-webpack-plugin');
var webpack = require('webpack');
var merge = require('webpack-merge');
// Load *package.json* so we can use `dependencies` from there
var pkg = require('./package.json');


const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};


/* 
  Babel determines the env like this:

    - BABEL_ENV if set
    - NODE_ENV if set
    - defaults to development
*/
process.env.BABEL_ENV = TARGET;

// Setup common configuration
var common = {
  entry: PATHS.app,
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css'],
        include: PATHS.app
      },
      /* setup jsx */
      {
        test: /\.jsx$/,
        loaders: ['babel'],
        include: PATHS.app
      },
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: PATHS.app
      }
    ]
  },
  plugins: [
    new HtmlwebpackPlugin({
      title: 'Kanban app'
    })
  ]
};

// Setup a default setup if we are not using npm
if(TARGET === 'start' || !TARGET) {
  // merge common with dev specific
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,

      // display only errors to reduce the amount of output
      stats: 'errors-only',

      // parse host and port from env so this is easy
      // to customize (default: localhost:8080)
      host: process.env.HOST,
      port: process.env.PORT
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

if(TARGET === 'build') {
  module.exports = merge(common, {
    entry: {
      app: PATHS.app,
      vendor: Object.keys(pkg.dependencies).filter(function(v) {
        return v !== 'alt-utils';
      })
    },
    /* important! */
    output: {
      path: PATHS.build,
      filename: '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js'
    },
    devtool: 'source-map',
    plugins: [
      new Clean([PATHS.build]),
      // Extract vendor and manifest files
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),
      // Setting DefinePlugin affects React library size!
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}