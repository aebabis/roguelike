var TYPES = [
    'MELEE_PHYSICAL',
    'RANGED_PHYSICAL',
    'FIRE',
    'COLD',
    'ELECTRICAL',
    'ENERGY',
    'POISON'
];

var TYPE_MAP = TYPES.reduce((obj, type) => {
    obj[type] = type;
    return obj;
}, {});

export default new Proxy(TYPE_MAP, {
    get: function(obj, prop) {
        var value = obj[prop];
        if(typeof value === 'undefined') {
            throw new Error(`Unrecognized damage type: ${prop}. Choose from: ${Object.keys(obj)}`);
        } else {
            return value;
        }
    }
});
