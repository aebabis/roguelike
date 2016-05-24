import { default as Armor } from "./Armor.js";

export default class MediumArmor extends Armor {
    getPhysicalReduction() {
        return 2;
    }

    getMagicalReduction() {
        return 0;
    }
}
