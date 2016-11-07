var webpack = require('webpack');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/client/js/app/Bootstrapper.js',
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Vaults of Git’recht'
        }),

        new webpack.ProvidePlugin({
            // http://stackoverflow.com/a/34354301/2993478
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new webpack.ProvidePlugin({
            Random: 'random-js'
        })
    ],
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules', 'es6-a-star', 'es6-a-star.js')
                ],

                test: /\.js$/,
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /[\/]angular\.js$/,
                loader: 'exports?angular'
            }, {
                //loader: 'style!css',
                loaders: ['style', 'css', 'sass'],
                test: /\.s?css$/
            }, {
                loader: 'url-loader?limit=100000',
                test: /\.png$/
            }
        ],
        resolve: {
            alias: {
                angular: __dirname + '/node_modules/angular'
            }
        }
    },

    // http://stackoverflow.com/questions/35171288/error-cannot-resolve-module-style-loader
    resolve: {
        extensions: ['', '.js', '.css'],
        modulesDirectories: [
            'node_modules'
        ]
    }
};
