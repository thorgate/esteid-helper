var path = require("path");

module.exports = {
    entry: {
        main: "./global"
    },
    output: {
        path: path.join(__dirname, '..', "dist"),
        filename: "Esteid.[name].js",
        library: ["Esteid"],
        libraryExport: 'default',
        libraryTarget: "umd"
    },

    module: {
        rules: [{
            test: /\.js$/, // Transform all .js files required somewhere with Babel
            exclude: /node_modules/,
            use: 'babel-loader',
        }]
    }
};
