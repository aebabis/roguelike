import { default as Enemies } from '../../../../../src/client/js/app/entities/creatures/enemies/Enemies.js';

const expect = require('chai').expect;

describe('Enemies', function() {
    it('should all construct without throwing', function() {
        Object.keys(Enemies).map(constructorName => Enemies[constructorName]).forEach(function(Enemy) {
            new Enemy();
        });
    });
});
