import Strategy from './Strategy.js';

/**
 * @class CompositeStrategy
 * @description Strategy used for combining strategies
 */
export default class CompositeStrategy extends Strategy {
    constructor() {
        super();
        var components = this._components = Array.from(arguments);
        if(components.length === 0) {
            throw new Error('At least one strategy required as parameter');
        }
        components.forEach(function(arg) {
            if(!(arg instanceof Strategy)) {
                throw new Error('Illegal argument: ' + arg);
            }
        });
    }

    getNextMove(dungeon, creature) {
        var strategies = this._components[Symbol.iterator]();
        var currentStrategy;
        var move;
        while(currentStrategy = strategies.next().value) {
            if(move = currentStrategy.getNextMove(dungeon, creature)) {
                return move;
            }
        }
        return null;
    }

    observeMove(dungeon, observer, actor, move) {
        this._components.forEach((component)=>component.observeMove(dungeon, observer, actor, move));
    }
}
