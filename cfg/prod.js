var webpack = require("webpack");

var base = require('./base.js');


module.exports = Object.assign(base, {
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]
});
