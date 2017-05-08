import Items from '../Items.js';

const SEQUENCES = [
    [Items.Slingshot, Items.Shortbow, Items.Longbow],
    [Items.Stick, Items.Dagger, Items.Shortsword, Items.Longsword],
    [Items.LightArmor, Items.MediumArmor, Items.HeavyArmor]
];

export default {
    is(item1) {
        return {
            strictlyBetterThan(item2) {
                return !!SEQUENCES.find(list => {
                    const index1 = list.findIndex(Constructor => item1 instanceof Constructor);
                    const index2 = list.findIndex(Constructor => item2 instanceof Constructor);
                    return index1 !== -1 && index2 !== -1 && index1 > index2;
                });
            }
        };
    }
};