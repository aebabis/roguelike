import { default as Geometry } from '../src/client/js/app/util/Geometry';

var expect = require('chai').expect;

describe('Geometry', function() {
    it('should tell when 2 lines intersect', function() {
        var p0 = {x: 2.5, y: .5};
        var p1 = {x: .5, y: .5};
        var q0 = {x: 2, y: 0};
        var q1 = {x: 2, y: 1};

        expect(Geometry.intersects(p0, p1, q0, q1)).to.equal(true);
    });
});
