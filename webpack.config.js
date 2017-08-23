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
            title: 'Vaults of Git’recht',
            favicon: './src/client/images/favicon.ico'
        }),
        new webpack.ProvidePlugin({
            Random: 'random-js'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src', 'client', 'images', 'small'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, 'dist', 'images', 'spritesheet.png'),
                css: [
                    path.resolve(__dirname, 'dist', 'images', 'sprites.css'),
                    [path.resolve(__dirname, 'dist', 'images', 'spritesheet.json'), {
                        format: 'pixi_template'
                    }]
                ]
            },
            apiOptions: {
                cssImageRef: 'spritesheet.png'
            },
            spritesmithOptions: {
                padding: 2
            },
            customTemplates: {
                pixi_template: function(data) {
                    const json = {
                        frames: data.sprites.reduce(function(obj, item) {
                            obj[item.name] = {
                                frame: {
                                    x: item.x,
                                    y: item.y,
                                    w: item.width,
                                    h: item.height
                                },
                                rotated: false,
                                trimmed: false,
                                spriteSourceSize: {x: item.x, y: item.y, w: item.w, h: item.h},
                                sourceSize: {w: item.w, h: item.h}
                            };
                            return obj;
                        }, {}),
                        meta: {
                            app: 'spritesheet-templates',
                            //"version": "10.2.1",
                            image: 'spritesheet.png',
                            scale: 1,
                            size: {
                                w: data.spritesheet.width,
                                h: data.spritesheet.height
                            }
                        }
                    };

                    return JSON.stringify(json, null, 4);
                }
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [path.resolve(__dirname, 'src')],
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.s?css$/,
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'css-loader',
                }, {
                    loader: 'sass-loader',
                }]
            }, {
                loader: 'url-loader?limit=100000',
                test: /\.png$/
            }
        ]
    },

    // http://stackoverflow.com/questions/35171288/error-cannot-resolve-module-style-loader
    resolve: {
        extensions: ['.js', '.css'],
        modules: [
            'node_modules'
        ]
    }
};
