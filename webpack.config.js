const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
//const webpack = require('webpack');

module.exports = {
    "mode": "development",
    "entry": {
      "gyroBackground": path.join(__dirname, "entry.js"),
      "gyroBackground.min": path.join(__dirname, "entry.js"),
    },
    "plugins": [
      //new BundleAnalyzerPlugin()
    ],
    "devtool": "cheap-source-map",
    "devServer": {
      host: '0.0.0.0',
      watchContentBase: true,
      hot: true,
      port: 3000,
      compress: true,
      contentBase: __dirname,
      publicPath: '/dist/'
    },
    "output": {
        "path": path.join(__dirname, '/dist'),
        "filename": "[name].js",
        "libraryTarget": "var",
        "library": "GyroBackground"
    },
    "optimization": {
      "minimize": true,
      "minimizer": [new UglifyJsPlugin({
        include: /\.min\.js$/,
        parallel: true,
        uglifyOptions: {
          mangle: true
        }
      })],
      "usedExports": true,
      "sideEffects": true
    },
    "module": {
        "rules": [
            {
                "test": /\.js$/,
                "exclude": /node_modules/,
                "include": __dirname,
                "use": {
                    "loader": "babel-loader",
                    "options": {
                        "presets": [
                            "@babel/env",
                            //{ modules: false }
                        ]
                    }
                }
            }
        ]
    }
}
