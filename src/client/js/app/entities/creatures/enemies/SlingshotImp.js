import Creature from '../Creature.js';
import Strategies from '../strategies/Strategies.js';

import Slingshot from '../../weapons/Slingshot.js';

export default class SlingshotImp extends Creature {
    /**
      * @class SlingshotImp
      * @description Basic ranged enemy.
      */
    constructor() {
        super();
        this.addItem(new Slingshot());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.ChaseStrategy(),
            new Strategies.FleeStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 3;
    }

    getBaseSpeed() {
        return 550;
    }
}
