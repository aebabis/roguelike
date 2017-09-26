import PlayableCharacter from '../PlayableCharacter';

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

    getBaseSpeed() {
        return 450;
    }

    getFriendlyDescription() {
        return 'An adventurer who excels in close-quarters combat. Begins with a Dash Attack to close-in on enemies quickly';
    }

    toString() {
        return 'Fighter';
    }
}
