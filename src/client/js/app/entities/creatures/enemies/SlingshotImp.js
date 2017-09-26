import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Slingshot from '../../weapons/Slingshot';

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
