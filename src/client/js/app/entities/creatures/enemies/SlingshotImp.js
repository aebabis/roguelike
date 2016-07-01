import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import Sling from '../../weapons/Sling.js';

export default class SlingshotImp extends Creature {
    /**
      * @class SlingshotImp
      * @description Basic ranged enemy.
      */
    constructor() {
        super();
        this.addItem(new Sling());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.FleeStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 3;
    }

    getSpeed() {
        return 550;
    }
}
