import PlayableCharacter from '../PlayableCharacter.js';

export default class Rogue extends PlayableCharacter {
    getBackpackSize() {
        return 4;
    }

    getBaseHP() {
        return 10;
    }

    getBaseMana() {
        return 10;
    }

    getSpeed() {
        return 350;
    }

    toString() {
        return 'Rogue';
    }
}
