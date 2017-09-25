import PlayableCharacter from '../PlayableCharacter.js';

export default class Miner extends PlayableCharacter {
    constructor() {
        super();
    }

    getBackpackSize() {
        return 4;
    }

    getBaseHP() {
        return 10;
    }

    getBaseMana() {
        return 6;
    }

    getBaseSpeed() {
        return 425;
    }

    getFriendlyDescription() {
        return 'A hardy adventurer who can dig through walls';
    }

    toString() {
        return 'Miner';
    }
}
