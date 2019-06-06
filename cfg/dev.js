var _ = require('lodash');
var path = require("path");
var webpack = require("webpack");

var base = require('./base.js');


var cfg = _.extend(base, {
    mode: 'development',

    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("dev")
            }
        })
    ]
});

cfg.output.path = path.join(__dirname, '..', "dev-dist");


module.exports = cfg;
