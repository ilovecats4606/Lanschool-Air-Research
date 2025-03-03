const path = require("path");
const buildDir = path.join(__dirname, "..", "..", "..", "build");

module.exports = {
    mode: 'production',
    entry: './src/window/webpack/preload.js',
    output: {
        path: path.resolve(buildDir, 'window'),
        filename: 'preload.js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [path.resolve("./node_modules"), path.resolve("./src/window/webpack/titlebar")],
        extensions: [".ts", ".js"],
    },
    target: 'electron-renderer'
};