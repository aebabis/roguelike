import { default as Classes } from '../entities/creatures/classes/Classes.js';

import { default as Abilities } from "../abilities/Abilities.js";
import { default as Armors } from "../entities/armor/Armors.js";
import { default as Weapons } from "../entities/weapons/Weapons.js";

var Purchaseables = Object.assign({}, Abilities, Armors, Weapons);

function template() {
    var $dialog = $(`
        <dialog class="character-builder">
            <form method="dialog">
                <div class="class">
                    ${Object.keys(Classes).sort().map(function(className) {
                        return `<label><input type="radio" name="class" value="${className}"> ${className}</label>`
                    }).join('')}
                </div>
                <div class="items weapons">
                    ${Object.keys(Weapons).map(function(className) {
                        return `<label><input type="checkbox" name="${className}"> ${className} (<span class="cost">${COSTS[className]}</span>)</label>`
                    }).join('')}
                </div>
                <div class="items armors">
                    ${Object.keys(Armors).map(function(className) {
                        return `<label><input type="checkbox" name="${className}"> ${className} (<span class="cost">${COSTS[className]}</span>)</label>`
                    }).join('')}
                </div>
                <div class="items abilities">
                    ${Object.keys(Abilities).map(function(className) {
                        return `<label><input type="checkbox" name="${className}"> ${className} (<span class="cost">${COSTS[className]}</span>)</label>`
                    }).join('')}
                </div>
                <div class="total"></div>
                <input type="submit" value="OK">
            </form>
        </dialog>`);

    function update() {
        var legal = false;
        var Class = $dialog.find('.class input:checked').val();
        if(Class) {
            var equipment = STARTING_EQUIPMENT[Class];
            var items = equipment.items;
            var money = equipment.money;
            var cost = $dialog.find('.items input:checked').map(function() {
                return $(this).attr('name');
            }).toArray().reduce(function(prev, curr) {
                if(items.includes(curr)) {
                    return prev + Math.floor(COSTS[curr] / 2);
                } else {
                    return prev + Math.floor(COSTS[curr]);
                }
            }, 0);
            legal = cost <= money;
            $dialog.find('.total').text(cost + ' / ' + money).css('color', legal ? '' : 'red');
        }
        $dialog.find('input[type="submit"]').prop('disabled', !legal);
    }

    $dialog.on('click', '.class input', function() {
        var className = $(this).val();
        $dialog.find('input[type="checkbox"]').prop("checked", false).each(function() {
            $(this).parent().find('.cost').css('color', '').text(COSTS[$(this).attr('name')]);
        });
        STARTING_EQUIPMENT[className].items.forEach(function(item) {
            $dialog.find(`input[type="checkbox"][name="${item}"]`)
                    .prop("checked", true)
                    .parent().find('.cost').css('color', 'green').text(Math.floor(COSTS[item] / 2));
        });
    });

    $dialog.on('click', 'input', update);

    update();

    return $dialog;
}

var COSTS = {
    Stick: 5,
    Dagger: 10,
    Shortsword: 20,
    Longsword: 30,

    Sling: 10,
    Shortbow: 30,
    Longbow: 50,

    Fireball: 30,
    ForceDart: 20,
    LesserSnare: 15,

    LightArmor: 15,
    MediumArmor: 25,
    HeavyArmor: 40,

    LightRobe: 5,
    MediumRobe: 15,
    HeavyRobe: 25,

    HealthPotion: 10, // 3 HP
    ManaPotion: 10,   // 4 MP
    CleansingPotion: 10
}

var STARTING_EQUIPMENT = {
    Fighter: {
        money: 50,
        items: ["MediumArmor", "Longsword"]
    },
    Rogue: {
        money: 50,
        items: ["Sling", "Dagger", "Light Armor"]
    },
    Wizard: {
        money: 42,
        items: ["Stick", "ForceDart"]
    }
}

export default class CharacterBuilder {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
        var $dialog = template().appendTo('body');
        var $form = $dialog.find('form').on('submit', (event) => {
            var data = new FormData($form[0]);

            var CharacterClass = Classes[data.get('class')];

            var player = new CharacterClass();

            Object.keys(Purchaseables).forEach(function(purchaseableName) {
                if(!!data.get(purchaseableName)) {
                    var item = new Purchaseables[purchaseableName]();
                    if(item.getManaCost) {
                        player.addAbility(item);
                    } else {
                        player.addItem(item);
                    }
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
