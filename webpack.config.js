var path = require('path');

module.exports = {
    entry: "./src/client/js/app/ui/LayoutBootstrapper.js",
    output: {
        path: path.join(__dirname, '/dist'),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader',
                //include: [path.resolve(__dirname, 'src')],

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
