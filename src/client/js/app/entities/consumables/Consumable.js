import Item from '../Item.js';

export default class Consumable extends Item {
    isUseable() {
        return true;
    }

    isTargetted() {
        return false;
    }

    use(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }
}
