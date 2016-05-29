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
                loader: "style!css",
                test: /\.css$/
            }, {
                loader: 'babel-loader',
                //include: [path.resolve(__dirname, 'src')],

                test: /\.js$/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};
