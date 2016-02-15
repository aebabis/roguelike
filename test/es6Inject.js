var es6Inject = (function(scope) {
    'use strict';
    var injected = [];

    afterEach(function() {
        injected.forEach(function(moduleName) {
            delete scope[module];
        })
    });

    /**
     * @function es6Inject
     * @description Imports an ES6 modules an injects it into the global
     * scope for ease of testing. Based on Bardjs. To use, call inside
     * a `beforeEach` function of your unit test:
     * <pre>
     * beforeEach(function(done) {
     *     es6Inject(['path/to/app/MyModule.js']).then(done, done);
     * });
     * </pre>
     * @param {Array<String>} dependencies - A list of modules required
     * for the test.
     * @return {Promise} - A promise that resolves when the dependencies
     * are all injected.
     */
    scope.es6Inject = function(dependencies) {
        return dependencies.reduce(function(chain, fileName) {
            return chain.then(function() {
                return System.import(fileName).then(function(module) {
                    // Remove leading namespace and trailing '.js'
                    var moduleName = fileName.match(/(?:[^\/]+\/)*([^\.]*)(\.js)?/)[1];
                    injected.push(moduleName);
                    global[moduleName] = module.default;
                });
            });
        }, Promise.resolve());
    }
})(this.window || global);
