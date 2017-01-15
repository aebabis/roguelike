const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');

module.exports = {
    entry: [
        './src/client/js/app/Bootstrapper.js',
    ],
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
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src', 'client', 'images', 'small'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, 'dist', 'images', 'spritesheet.png'),
                css: [
                    [path.resolve(__dirname, 'dist', 'images', 'spritesheet.json'), {
                        format: 'json_texture'
                    }]
                ]
            }
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
                angular: path.join(__dirname, './node_modules/angular/index.js')
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
