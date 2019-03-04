const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    "mode": "development",
    "entry": {
      "gyroBackground": path.join(__dirname, "entry.js"),
      "gyroBackground.min": path.join(__dirname, "entry.js"),
    },
    "devtool": "source-map",
    "devServer": {
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
        include: /\.min\.js$/
      })]
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
                            "@babel/env"
                        ]
                    }
                }
            }
        ]
    }
}
