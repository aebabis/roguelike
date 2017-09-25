import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import LightArmor from '../../armor/LightArmor.js';
import Longbow from '../../weapons/Longbow.js';

export default class MongolianHorseArcher extends Creature {
    /**
      * @class SlingshotImp
      * @description Basic ranged enemy.
      */
    constructor() {
        super();
        this.addItem(new Longbow());
        this.addItem(new LightArmor());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.FleeStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 6;
    }

    getBaseSpeed() {
        return 350;
    }
}
