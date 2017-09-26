import PlayableCharacter from '../PlayableCharacter';

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

    getBaseSpeed() {
        return 375;
    }

    toString() {
        return 'Rogue';
    }
}
