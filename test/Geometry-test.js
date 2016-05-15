var System = require('es6-module-loader').System;
var expect = require('chai').expect;

var depList = ['src/client/js/app/util/Geometry.js'];

var MODULES = {};

describe('Geometry', function() {
    before(function(done) {
        // Files have to be loaded sequentially to prevent traceur/es6-module-loader
        // dependency resolution problem.
        depList.reduce(function(chain, fileName) {
            return chain.then(function() {
                return System.import(fileName).then(function(module) {
                    var modName = fileName.split(/[\/\.]/);
                    modName = modName[modName.length - 2];
                    MODULES[modName] = module.default;
                });
            });
        }, Promise.resolve()).then(done, done);
    });

    it('should tell when 2 lines intersect', function() {
        var p0 = {x: 2.5, y: .5};
        var p1 = {x: .5, y: .5};
        var q0 = {x: 2, y: 0};
        var q1 = {x: 2, y: 1};

        expect(MODULES['Geometry'].intersects(p0, p1, q0, q1)).to.equal(true);
    });
});
