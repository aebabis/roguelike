import Entity from "./Entity.js";

export default class Item extends Entity {
    isEquipable() {
        return false;
    }
}
