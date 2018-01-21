import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import LightArmor from '../../armor/LightArmor';
import Shortbow from '../../weapons/Shortbow';

export default class MongolianHorseArcher extends Creature {
    /**
      * @class SlingshotImp
      * @description Basic ranged enemy.
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

    getBaseHP() {
        return 6;
    }

    getBaseSpeed() {
        return 350;
    }
}
