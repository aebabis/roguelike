import Item from '../Item';

export default class Consumable extends Item {
    isUseable() {
        return true;
    }

    isTargetted() {
        return false;
    }

    getRange() {
        return 0;
    }

    use(dungeon, creature) {
        throw new Error('Abstract method not implemented');
    }
}
