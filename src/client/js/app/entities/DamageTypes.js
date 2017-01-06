const TYPE_LIST = [
    'MELEE_PHYSICAL',
    'RANGED_PHYSICAL',
    'FIRE',
    'COLD',
    'ELECTRICAL',
    'ENERGY',
    'POISON'
];

const TYPE_MAP = TYPE_LIST.reduce((obj, type) => {
    obj[type] = type;
    return obj;
}, {});

/**
 * A map of legal damage types in the game. All damage must
 * have a type. This object is guarded to make sure that
 * illegal types aren't silently accessed.
 */
const DAMAGE_TYPES = (typeof Proxy === 'undefined') ? TYPE_MAP : new Proxy(TYPE_MAP, {
    get: function(obj, prop) {
        const value = obj[prop];
        if(typeof value === 'undefined') {
            throw new Error(`Unrecognized damage type: ${prop}. Choose from: ${Object.keys(obj)}`);
        } else {
            return value;
        }
    }
});

export default DAMAGE_TYPES;