var DAMAGE_TYPES = [
    'MELEE_PHYSICAL',
    'RANGED_PHYSICAL',
    'FIRE',
    'COLD',
    'ELECTRICAL',
    'ENERGY',
    'POISON'
];

var TYPE_MAP = DAMAGE_TYPES.reduce((obj, type) => {
    obj[type] = type;
    return obj;
}, {});

DAMAGE_TYPES = (typeof Proxy === 'undefined') ? TYPE_MAP : new Proxy(TYPE_MAP, {
    get: function(obj, prop) {
        var value = obj[prop];
        if(typeof value === 'undefined') {
            throw new Error(`Unrecognized damage type: ${prop}. Choose from: ${Object.keys(obj)}`);
        } else {
            return value;
        }
    }
});

export default DAMAGE_TYPES;
