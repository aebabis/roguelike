import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

export default class Cow extends Creature {
    /**
     * @class Cow
     * @description Basic melee enemy. Chases the player
     */
    constructor() {
        super();
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.RandomWalkStrategy(),
            new Strategies.FleeStrategy()
        ));
    }

    getSpeed() {
        return 600;
    }

    getBaseHP() {
        return 4;
    }
}
