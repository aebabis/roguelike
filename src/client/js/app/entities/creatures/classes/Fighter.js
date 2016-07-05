import PlayableCharacter from '../PlayableCharacter.js';
import DashAttack from '../../../abilities/DashAttack';

export default class Fighter extends PlayableCharacter {
    constructor() {
        super();
        this.addAbility(new DashAttack());
    }

    getBackpackSize() {
        return 3;
    }

    getBaseHP() {
        return 12;
    }

    getBaseMana() {
        return 6;
    }

    getSpeed() {
        return 450;
    }

    toString() {
        return 'Fighter';
    }
}
