import Classes from '../entities/creatures/classes/Classes.js';

import Abilities from '../abilities/Abilities.js';
import Armors from '../entities/armor/Armors.js';
import Consumables from '../entities/consumables/Consumables.js';
import Weapons from '../entities/weapons/Weapons.js';

import AbilityConsumable from '../entities/consumables/AbilityConsumable.js';

var Purchaseables = Object.assign({}, Abilities, Armors, Consumables, Weapons);

var MELEE_WEAPON_COSTS = {
    Stick: 5,
    Dagger: 10,
    Shortsword: 20,
    Longsword: 30
};

var RANGED_WEAPON_COSTS = {
    Slingshot: 10,
    Shortbow: 30,
    Longbow: 60
};

var ARMOR_COSTS = {
    LightArmor: 15,
    MediumArmor: 25,
    HeavyArmor: 40/*,

    LightRobe: 5,
    MediumRobe: 15,
    HeavyRobe: 25*/
};

var ABILITY_COSTS = {
    Fireball: 30,
    LesserSnare: 15
};

var CONSUMABLE_COSTS = {
    CherrySoda: 10,
    BlueberrySoda: 10,
    CleansingPotion: 10
};

var ABILITY_CONSUMEABLE_COSTS = {
    Fireball: 20,
    ForceDart: 10,
    LesserSnare: 10
};

var STARTING_EQUIPMENT = {
    Fighter: {
        money: 70,
        items: ['MediumArmor', 'Longsword']
    },
    Rogue: {
        money: 60,
        items: ['Slingshot', 'Dagger', 'Light Armor']
    },
    Wizard: {
        money: 55,
        items: ['Stick', 'ForceDart']
    }
};

var COSTS = Object.assign({}, MELEE_WEAPON_COSTS, RANGED_WEAPON_COSTS, ARMOR_COSTS, ABILITY_COSTS, CONSUMABLE_COSTS);

function template() {
    var $dialog = $(`
        <dialog class='character-builder'>
            <form method='dialog'>
                <div class='class'>
                    ${Object.keys(Classes).sort().map(function(className) {
                        return `<label><input type='radio' name='class' value='${new Classes[className]().getName()}'> ${className}</label>`;
                    }).join('')}
                </div>
                <div class='item melee-weapon select'>
                    <label>
                        <span class='label-text'>Melee Weapon</span>
                        <select name='melee-weapon'>
                            <option>None</option>
                            ${Object.keys(MELEE_WEAPON_COSTS).map(function(className) {
                                return `<option value='${className}'> ${new Purchaseables[className]().getName()} (<span class='cost'>${COSTS[className]}</span>)</label>`;
                            }).join('')}
                        </select>
                    </label>
                </div>
                <div class='item ranged-weapon select'>
                    <label>
                        <span class='label-text'>Ranged Weapon</span>
                        <select name='ranged-weapon'>
                            <option>None</option>
                            ${Object.keys(RANGED_WEAPON_COSTS).map(function(className) {
                                return `<option value='${className}'> ${new Purchaseables[className]().getName()} (<span class='cost'>${COSTS[className]}</span>)</label>`;
                            }).join('')}
                        </select>
                    </label>
                </div>
                <div class='item armors select'>
                    <label>
                        <span class='label-text'>Armor</span>
                        <select name='armor'>
                            <option>None</option>
                            ${Object.keys(ARMOR_COSTS).map(function(className) {
                                return `<option value='${className}'> ${new Purchaseables[className]().getName()} (<span class='cost'>${COSTS[className]}</span>)</label>`;
                            }).join('')}
                        </select>
                    </label>
                </div>
                <div class='items abilities'>
                    ${Object.keys(Abilities).filter((ability)=>ABILITY_COSTS[ability]).map(function(className) {
                        return `<label>
                            <input type='checkbox' name='${className}'>
                            <span class='label-text'>${new Purchaseables[className]().getName()} (<span class='cost'>${COSTS[className]}</span>)</span>
                        </label>`;
                    }).join('')}
                </div>
                <div class='items consumables'>
                    ${Object.keys(Consumables).map(function(className) {
                        return `<label><input type='number' min="0" name='${className}' value='0'><span class='label-text'>${new Purchaseables[className]().getName()} (<span class='cost'>${COSTS[className]}</span>)</span></label>`;
                    }).join('')}
                </div>
                <div class='items ability-consumables'>
                    ${Object.keys(Abilities).filter((ability)=>ABILITY_CONSUMEABLE_COSTS[ability]).map(function(className) {
                        return `<label>
                            <input type='number' min="0" name='${className}_consumable' value='0'>
                            <span class='label-text'>${new AbilityConsumable(new Abilities[className]).getName()} (<span class='cost'>${ABILITY_CONSUMEABLE_COSTS[className]}</span>)</span>
                        </label>`;
                    }).join('')}
                </div>
                <div class='total'></div>
                <input type='submit' value='OK'>
            </form>
        </dialog>`);

    function getCost() {
        var data = new FormData($dialog.find('form')[0]);
        var meleeWeaponCost = MELEE_WEAPON_COSTS[data.get('melee-weapon')] || 0;
        var rangedWeaponCost = RANGED_WEAPON_COSTS[data.get('ranged-weapon')] || 0;
        var armorCost = ARMOR_COSTS[data.get('armor')] || 0;

        var abilityCosts = Object.keys(ABILITY_COSTS)
                .filter(name=>!!data.get(name))
                .map(name=>ABILITY_COSTS[name])
                .reduce((a, b) => a + b, 0);

        var consumableCosts = Object.keys(CONSUMABLE_COSTS)
                .map(function(name) {
                    var cost = CONSUMABLE_COSTS[name];
                    var amount = data.get(name);
                    return cost * amount || 0;
                })
                .reduce((a, b) => a + b, 0);

        var abilityConsumableCosts = Object.keys(ABILITY_CONSUMEABLE_COSTS)
                .map(function(name) {
                    var fieldName = name + '_consumable';
                    var cost = ABILITY_CONSUMEABLE_COSTS[name];
                    var amount = data.get(fieldName);
                    return cost * amount || 0;
                })
                .reduce((a, b) => a + b, 0);

        return meleeWeaponCost +
            rangedWeaponCost +
            armorCost +
            abilityCosts +
            consumableCosts +
            abilityConsumableCosts;
    }

    function update() {
        var legal = false;
        var Class = $dialog.find('.class input:checked').val();
        if(Class) {
            var equipment = STARTING_EQUIPMENT[Class];
            //var items = equipment.items;
            var money = equipment.money;
            var cost = getCost();
            legal = cost <= money;
            $dialog.find('.total').text(cost + ' / ' + money).css('color', legal ? '' : 'red');
        }
        $dialog.find('input[type="submit"]').prop('disabled', !legal);
    }

    $dialog.on('input', 'input, select', update);

    // Wait for autocomplete
    setTimeout(update);

    return $dialog;
}

export default class CharacterBuilder {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        var $dialog = template().appendTo('body');
        var $form = $dialog.find('form').on('submit', () => {
            let data = new FormData($form[0]);

            let className = data.get('class');
            let player = new Classes[className]();
            switch(className){
            case 'Fighter':
                player.addAbility(new Abilities.DashAttack());
                break;
            case 'Wizard':
                player.addAbility(new Abilities.ForceDart());
                break;
            case 'Rogue':
                break;
            }

            let MeleeWeaponClass = Purchaseables[data.get('melee-weapon')];
            let RangedWeaponClass = Purchaseables[data.get('ranged-weapon')];
            let ArmorClass = Purchaseables[data.get('armor')];

            [MeleeWeaponClass, RangedWeaponClass, ArmorClass].filter(Boolean).forEach(function(Class) {
                player.addItem(new Class());
            });

            Object.keys(Purchaseables).forEach(function(purchaseableName) {
                let value = data.get(purchaseableName);
                if(value) {
                    let count = isNaN(value) ? 1 : +value;
                    for(let i = 0; i < count; i++) {
                        let item = new Purchaseables[purchaseableName]();
                        if(item.getManaCost) {
                            player.addAbility(item);
                        } else {
                            player.addItem(item);
                        }
                    }
                }
            });

            Object.keys(ABILITY_CONSUMEABLE_COSTS).forEach(function(purchaseableName) {
                let value = data.get(purchaseableName + '_consumable');
                for(let i = 0; i < value; i++) {
                    player.addItem(new AbilityConsumable(new Abilities[purchaseableName]));
                }
            });

            this._resolve(player);
        });
        $form.find('input').eq(0).click();
        $dialog[0].showModal();
    }

    getCharacter() {
        return this._promise;
    }
}
