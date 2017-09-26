import PlayableCharacter from '../PlayableCharacter';

export default class Wizard extends PlayableCharacter {
    getBackpackSize() {
        return 3;
    }

    getBaseHP() {
        return 8;
    }

    getBaseMana() {
        return 16;
    }

    getBaseSpeed() {
        return 450;
    }

    toString() {
        return 'Wizard';
    }
}
