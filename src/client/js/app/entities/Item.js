import Entity from './Entity';

export default class Item extends Entity {
    isTargetted() {
        return false;
    }
}
