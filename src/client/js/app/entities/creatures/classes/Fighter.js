import PlayableCharacter from '../PlayableCharacter.js';

export default class Fighter extends PlayableCharacter {
    constructor() {
        super();
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
