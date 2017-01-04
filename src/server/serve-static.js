module.exports = function(app) {
    // Determine how to serve static content
    if(process.env.NODE_ENV !== 'production') {
        // https://github.com/glenjamin/webpack-hot-middleware/blob/master/example/server.js
        // Step 1: Create & configure a webpack compiler
        const path = require('path');
        const webpack = require('webpack');
        const webpackConfig = require(path.join(__dirname, '..', '..', 'webpack.config.js'));

        const entryWithAutoReload = ['webpack-hot-middleware/client?reload=true'].concat(webpackConfig.entry);
        const compiler = webpack(Object.assign({}, webpackConfig, { entry: entryWithAutoReload }));

        // Step 2: Attach the dev middleware to the compiler & the server
        app.use(require('webpack-dev-middleware')(compiler, {
            noInfo: true, publicPath: webpackConfig.output.publicPath
        }));

        // Step 3: Attach the hot middleware to the compiler & the server
        app.use(require('webpack-hot-middleware')(compiler, {
            log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
        }));
    } else {
        app.use('/', require('express').static(__dirname + '/../../dist'));
    }
};