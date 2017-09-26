import Creature from '../Creature';
import Strategies from '../strategies/Strategies';

import Stick from '../../weapons/Stick';
import Fireball from '../../../abilities/Fireball';

export default class Witch extends Creature {
    constructor() {
        super();
        this.setMeleeWeapon(new Stick());
        this.addAbility(new Fireball());
        this.setStrategy(new Strategies.CompositeStrategy(
            new Strategies.AggressiveFireballStrategy(),
            new Strategies.ChaseStrategy(),
            new Strategies.RandomWalkStrategy(),
            new Strategies.IdleStrategy()
        ));
    }

    getBaseHP() {
        return 3;
    }

    getBaseMana() {
        return 10;
    }

    getBaseSpeed() {
        return 550;
    }
}
