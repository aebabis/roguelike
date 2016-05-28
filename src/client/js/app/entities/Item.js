import { default as Entity } from "./Entity.js";

export default class Item extends Entity {
    isItem() {
        return true;
    }
}
