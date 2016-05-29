var webpack = require('webpack');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: "./src/client/js/app/ui/LayoutBootstrapper.js",
    output: {
        path: path.join(__dirname, '/dist'),
        filename: "bundle.js"
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new webpack.ProvidePlugin({
            // http://stackoverflow.com/a/34354301/2993478
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.ProvidePlugin({
            Random: "random-js"
        })
    ],
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'bower_components', 'es6-a-star', 'es6-a-star.js')
                ],

                test: /\.js$/,
                query: {
                    presets: ['es2015']
                }
            }, {
                //loader: "style!css",
                loader: "style-loader!css-loader",
                test: /\.css$/
            }, {
                loader: "url-loader?limit=100000",
                test: /\.png$/
            }
        ]
    },

    // http://stackoverflow.com/questions/35171288/error-cannot-resolve-module-style-loader
    resolve: {
        extensions: ['', '.js', '.css'],
        modulesDirectories: [
          'node_modules'
        ]
    }
};
