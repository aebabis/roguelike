import PlayableCharacter from "../PlayableCharacter.js";

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

    getSpeed() {
        return 450;
    }

    toString() {
        return 'Wizard';
    }
}
