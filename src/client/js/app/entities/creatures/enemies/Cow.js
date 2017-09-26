import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

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

    getBaseSpeed() {
        return 600;
    }

    getBaseHP() {
        return 4;
    }
}
