import Armor from "./Armor.js";
import DamageTypes from "../DamageTypes.js";

export default class Heavy extends Armor {
    getReduction(type) {
        return (type === DamageTypes.MELEE_PHYSICAL || type === DamageTypes.RANGED_PHYSICAL) ? 3 : 0;
    }
}
