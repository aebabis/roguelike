import Armor from "./Armor.js";

export default class Heavy extends Armor {
    getPhysicalReduction() {
        return 3;
    }

    getMagicalReduction() {
        return 0;
    }
}
