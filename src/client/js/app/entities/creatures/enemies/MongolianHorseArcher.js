import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import LightArmor from '../../armor/LightArmor';
import Shortbow from '../../weapons/Shortbow';

export default class MongolianHorseArcher extends Creature {
    /**
      * @class MongolianHorseArcher
      * @description Difficult ranged enemy who tries to kite player
      */
    constructor() {
        super();
        this.addItem(new Shortbow());
        this.addItem(new LightArmor());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.FleeStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    /** @override */
    getBaseHP() {
        return 6;
    }

    /** @override */
    getBaseSpeed() {
        return 350;
    }
}
