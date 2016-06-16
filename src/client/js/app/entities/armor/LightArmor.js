import Armor from "./Armor.js";

export default class LightArmor extends Armor {
    getPhysicalReduction() {
        return 1;
    }

    getMagicalReduction() {
        return 0;
    }
}
