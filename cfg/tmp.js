var path = require("path");

module.exports = {
    entry: {
        global: "./global"
    },
    output: {
        path: path.join(__dirname, '..', "dist"),
        filename: "Esteid.[name].js",
        library: ["Esteid"],
        libraryTarget: "umd"
    },

    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },

    debug: true
};
