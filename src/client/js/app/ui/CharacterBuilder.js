import Classes from '../entities/creatures/classes/Classes';

import Abilities from '../abilities/Abilities';
import Armors from '../entities/armor/Armors';
import Consumables from '../entities/consumables/Consumables';
import Weapons from '../entities/weapons/Weapons';

import AbilityConsumable from '../entities/consumables/AbilityConsumable';

import CostedDistributionTable from '../util/CostedDistributionTable';

var dialogPolyfill = require('../../../../../node_modules/dialog-polyfill/dialog-polyfill');
require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.css');

const angular = require('angular');

var Purchaseables = Object.assign({}, Abilities, Armors, Consumables, Weapons);

const promiseHandlers = {};

const CHARACTERS = {
    Fighter: 70,
    Miner: 60,
    Rogue: 60,
    Wizard: 55
};

const MELEE_WEAPONS = {
    Stick: 0,
    Dagger: 10,
    Shortsword: 20,
    FrostDagger: 25,
    Warhammer: 25,
    Longsword: 30,
    LightningRod: 45
};
const RANGED_WEAPONS = {
    Slingshot: 10,
    Shortbow: 30,
    Longbow: 60
};

const ARMOR = {
    LightArmor: 15,
    MediumArmor: 25,
    HeavyArmor: 40/*,

    LightRobe: 5,
    MediumRobe: 15,
    HeavyRobe: 25*/
};

const CONSUMABLES = {
    CherrySoda: 10,
    BlueberrySoda: 10,

    Fireball: 20,
    ForceDart: 10,
    LesserSnare: 10
};

const ABILITIES = {
    Fireball: 30,
    Firebolt: 35,
    LesserSnare: 15
};

const characterTable = new CostedDistributionTable([{
    value: 'Fighter',
    weight: 1
}, {
    value: 'Miner',
    weight: 1
}, {
    value: 'Rogue',
    weight: 1
}, {
    value: 'Wizard',
    weight: 1
}]);

const meleeTable = new CostedDistributionTable([{
    value: 'Stick',
    weight: 1
}, {
    value: 'Dagger',
    weight: 1
}, {
    value: 'Shortsword',
    weight: 1
}, {
    value: 'Longsword',
    weight: 1
}, {
    value: 'FrostDagger',
    weight: 1
}, {
    value: 'LightningRod',
    weight: 1
}, {
    value: 'Warhammer',
    weight: 1
}]);

const rangedTable = new CostedDistributionTable([{
    value: 'Slingshot',
    weight: 1
}, {
    value: 'Shortbow',
    weight: 1
}, {
    value: 'Longbow',
    weight: 1
}]);

const armorTable = new CostedDistributionTable([{
    value: 'LightArmor',
    weight: 1
}, {
    value: 'MediumArmor',
    weight: 1
}, {
    value: 'HeavyArmor',
    weight: 1
}]);

const consumableTable = new CostedDistributionTable([{
    value: 'BlueberrySoda',
    weight: 40
}, {
    value: 'CherrySoda',
    weight: 100
}, {
    value: 'Fireball',
    weight: 10
}, {
    value: 'ForceDart',
    weight: 25
}, {
    value: 'LesserSnare',
    weight: 5
}, {
    value: null,
    weight: 100
}]);

const abilityTable = new CostedDistributionTable([{
    value: 'Fireball',
    weight: 10
}, {
    value: null,
    weight: 100
}]);

function getStartingAbilities(className) {
    switch(className) {
    case 'Fighter': return ['DashAttack'];
    case 'Miner': return ['Tunnel'];
    case 'Wizard': return ['ForceDart'];
    case 'Rogue': return ['Leap'];
    }
}

angular.module('vog', [])
    .filter('vogName', function() {
        return (name) => name.replace(/([^A-Z])([A-Z])/g, '$1 $2');
    })
    .component('characterBuild', {
        bindings: {
            build: '='
        },
        controller: function() {
            this.getSelectedAbilityNames = function() {
                const { build: { abilities } } = this;
                return Object.keys(ABILITIES).filter((ability)=>abilities[ability]);
            };
            this.getAbilityNames = function() {
                const { build: {character } } = this;
                return getStartingAbilities(character).concat(this.getSelectedAbilityNames());
            };
        },
        templateUrl: 'character-build.html'
    })
    .component('characterBuildPreview', {
        bindings: {
            build: '=',
            removeFromBackpack: '='
        },
        controller: function() {
            this.getSelectedAbilityNames = function() {
                const { build: { abilities } } = this;
                return Object.keys(ABILITIES).filter((ability)=>abilities[ability]);
            };
            this.getAbilityNames = function() {
                const { build: {character } } = this;
                return getStartingAbilities(character).concat(this.getSelectedAbilityNames());
            };
        },
        templateUrl: 'character-build-preview.html'
    })
    .controller('character-builder', ['$scope', 'promiseHandlers', function($scope, promiseHandlers) {
        const { resolve } = promiseHandlers;

        $scope.CHARACTERS = CHARACTERS;
        $scope.MELEE_WEAPONS = MELEE_WEAPONS;
        $scope.RANGED_WEAPONS = RANGED_WEAPONS;
        $scope.ARMOR = ARMOR;
        $scope.CONSUMABLES = CONSUMABLES;
        $scope.ABILITIES = ABILITIES;

        try {
            $scope.lastBuild = JSON.parse(localStorage.lastBuild);
        } catch(e) {
            console.error(e);
        }

        $scope.selections = {
            character: 'Fighter',
            melee: 'Stick',
            ranged: null,
            armor: null,
            backpack: [],
            abilities: {}
        };

        $scope.prebuilts = [{
            character: 'Fighter',
            melee: 'Warhammer',
            ranged: null,
            armor: 'MediumArmor',
            backpack: ['CherrySoda', 'ForceDart'],
            abilities: {}
        }, {
            character: 'Rogue',
            melee: 'FrostDagger',
            ranged: null,
            armor: 'LightArmor',
            backpack: ['CherrySoda'],
            abilities: {}
        }, {
            character: 'Wizard',
            melee: 'Stick',
            ranged: null,
            armor: 'LightArmor',
            backpack: ['BlueberrySoda'],
            abilities: {Fireball: true}
        }];

        $scope.selectLastBuild = function() {
            $scope.selections = $scope.lastBuild;
        };

        $scope.selectPrebuilt = function(index) {
            $scope.selections = $scope.prebuilts[index];
        };

        $scope.selectRandom = () => {
            const prng = Random.engines.mt19937();
            prng.seed(+new Date());

            const character = characterTable.rollEntry(prng);
            const melee = meleeTable.rollEntry(prng);
            const ranged = rangedTable.rollEntry(prng);
            const armor = armorTable.rollEntry(prng);
            const backpack = new Array(new Classes[character]().getBackpackSize()).fill(null).map(() =>
                consumableTable.rollEntry(prng)
            ).filter(Boolean);
            const abilities = new Array(new Classes[character]().getBackpackSize()).fill(null).map(() =>
                abilityTable.rollEntry(prng)
            ).filter(Boolean).reduce((prev, ability) => {
                prev[ability] = true;
                return prev;
            }, {});

            $scope.selections = {
                character,
                melee,
                ranged,
                armor,
                backpack,
                abilities,
                isRandom: true
            };
        };

        let isBuilderVisible = false;
        $scope.isBuilderVisible = () => isBuilderVisible;
        $scope.showBuilder = (visible = true) => isBuilderVisible = visible;

        $scope.getSelectedAbilityNames = function() {
            return Object.keys(ABILITIES).filter((ability)=>$scope.selections.abilities[ability]);
        };

        $scope.getConsumableName = function(consumable) {
            return $scope.isAbilityConsumable(consumable) ? `${consumable}_Consumable` : consumable;
        };

        $scope.isAbilityConsumable = function(consumable) {
            return consumable in Abilities;
        };

        $scope.getPurchaseableAbilities = function() {
            const character = new Classes[$scope.selections.character]();
            const mana = character.getBaseMana();
            return Object.keys(ABILITIES)
                .filter((name)=>new Abilities[name]().getManaCost() <= mana)
                .reduce(function(obj, name) {
                    obj[name] = ABILITIES[name];
                    return obj;
                }, {});
        };

        $scope.fixAbilities = function() {
            const { selections: { character, abilities } } = $scope;
            const mana = new Classes[character]().getBaseMana();
            Object.keys(ABILITIES).forEach(function(abilityName) {
                if(new Abilities[abilityName]().getManaCost() > mana) {
                    abilities[abilityName] = false;
                }
            });
        };

        $scope.getBackpackSize = function() {
            return new Classes[$scope.selections.character]().getInventory().getBackpack().length;
        };

        $scope.addToBackpack = function(item) {
            const { selections: { backpack } } = $scope;
            backpack.push(item);
            if(backpack.length > $scope.getBackpackSize()) {
                backpack.shift();
            }
        };

        $scope.removeFromBackpack = (index) => {
            console.log(index);
            $scope.selections.backpack.splice(index, 1);
        };

        $scope.getCost = function() {
            const { selections } = $scope;
            return MELEE_WEAPONS[selections.melee] +
                (RANGED_WEAPONS[selections.ranged] || 0) +
                (ARMOR[selections.armor] || 0) +
                selections.backpack.map((item)=>CONSUMABLES[item]).reduce((a, b)=>a+b, 0) +
                $scope.getSelectedAbilityNames().map((ability)=>ABILITIES[ability]).reduce((a, b)=>a+b, 0);
        };

        $scope.getMoney = function() {
            return CHARACTERS[$scope.selections.character];
        };

        $scope.isBuildLegal = function() {
            return $scope.getCost() <= $scope.getMoney();
        };

        $scope.submit = function() {
            const { selections } = $scope;

            if(!selections.isRandom) {
                localStorage.lastBuild = JSON.stringify(selections);
            }

            resolve(() => {
                const character = new Classes[selections.character]();
                getStartingAbilities(selections.character).concat($scope.getSelectedAbilityNames()).forEach(function(abilityName) {
                    character.addAbility(new Abilities[abilityName]());
                });

                [
                    Purchaseables[selections.melee],
                    Purchaseables[selections.ranged],
                    Purchaseables[selections.armor]
                ].filter(Boolean).forEach(function(Class) {
                    character.addItem(new Class());
                });

                selections.backpack.forEach(function(itemName) {
                    if(Consumables[itemName]) {
                        character.addItem(new Consumables[itemName]());
                    } else {
                        character.addItem(new AbilityConsumable(new Abilities[itemName]));
                    }
                });
                return character;
            });
        };
    }]).constant('promiseHandlers', promiseHandlers).run(['$templateCache', function($templateCache) {
        $templateCache.put('character-build.html',
            `<div class="character-build">
                <h3>{{$ctrl.build.character}}</h3>
                <div class="melee-weapon">{{$ctrl.build.melee | vogName}}</div>
                <div class="ranged-weapon" ng-if="$ctrl.build.ranged">{{$ctrl.build.ranged | vogName}}</div>
                <div class="armor" ng-if="$ctrl.build.armor">{{$ctrl.build.armor | vogName}}</div>
                <div class="abilities">
                    <span ng-repeat="name in $ctrl.getAbilityNames()"><span ng-if="!$first">, </span>{{name | vogName}}</span>
                </div>
                <div class="consumables">
                    <span ng-repeat="name in $ctrl.build.backpack"><span ng-if="!$first">, </span>{{name | vogName}}</span>
                </div>
            </div>`);
        $templateCache.put('character-build-preview.html',
            `<div class="character-build">
                <h3>{{$ctrl.build.character}}</h3>
                <div class="melee-weapon">{{$ctrl.build.melee | vogName}}</div>
                <div class="ranged-weapon" ng-if="$ctrl.build.ranged">{{$ctrl.build.ranged | vogName}}</div>
                <div class="armor" ng-if="$ctrl.build.armor">{{$ctrl.build.armor | vogName}}</div>
                <ul class="abilities">
                    <li ng-repeat="name in $ctrl.getAbilityNames() track by $index">
                        {{name | vogName}}
                    </li>
                </ul>
                <div class="consumables">
                    <button type="button"
                            ng-repeat="name in $ctrl.build.backpack track by $index"
                            ng-click="$ctrl.removeFromBackpack($index)">
                        {{name | vogName}}
                    </button>
                </div>
            </div>`);
        $templateCache.put('character-builder.html',
            `<form method="dialog" class="gitrecht" ng-controller="character-builder" ng-submit="submit()">
                <div class="section select-character" ng-if="!isBuilderVisible()">
                    <h2>Select Character</h2>
                    <div class="prebuilts">
                        <button ng-if="lastBuild" class="last-build" ng-click="selectLastBuild()">
                            <character-build build="lastBuild"></character-build>
                        </button>
                        <button ng-repeat="build in prebuilts" ng-click="selectPrebuilt($index)">
                            <character-build build="build"></character-build>
                        </button>
                        <button class="random" ng-click="selectRandom()">
                            <h3 class="screenreader">Random</h3>
                            <span>?</span>
                        </button>
                    </div>
                    <hr>
                    <button class="create-build" type="button" ng-click="showBuilder()">
                        <span>Make a Build</span>
                    </button>
                </div>
                <div class="section build-character" ng-if="isBuilderVisible()">
                    <button type="button" class="back" title="Return to select character" ng-click="showBuilder(false)"></button>
                    <div class="builder" ng-if="isBuilderVisible()">
                        <div class="selections">
                            <div class="col">
                                <div class="items">
                                    <h3>Character</h3>
                                    <label ng-repeat="(character, money) in CHARACTERS"
                                            class="tiny-icon-wrap"
                                            title="{{character | vogName}}"
                                            ng-class="{selected: selections.character === character}">
                                        <div class="icon-{{character}}"></div>
                                        <input type="radio" name="class" value="{{character}}" ng-model="selections.character" ng-click="fixAbilities()">
                                    </label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="items">
                                    <h3>Melee Weapon</h3>
                                    <label ng-repeat="(weapon, cost) in MELEE_WEAPONS"
                                            class="tiny-icon-wrap"
                                            title="{{weapon | vogName}}"
                                            ng-class="{selected: selections.melee === weapon}"
                                            data-cost="{{cost}}">
                                        <div class="icon-{{weapon}}"></div>
                                        <input type="radio" name="melee" ng-value="weapon" ng-model="selections.melee">
                                    </label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="items">
                                    <h3>Ranged Weapon</h3>
                                    <label class="tiny-icon-wrap" ng-class="{selected: selections.ranged === null}">
                                        <input type="radio" name="ranged" ng-value="null" title="None" ng-model="selections.ranged">
                                    </label>
                                    <label ng-repeat="(weapon, cost) in RANGED_WEAPONS"
                                            class="tiny-icon-wrap"
                                            title="{{weapon | vogName}}"
                                            ng-class="{selected: selections.ranged === weapon}"
                                            data-cost="{{cost}}">
                                        <div class="icon-{{weapon}}"></div>
                                        <input type="radio" name="ranged" ng-value="weapon" ng-model="selections.ranged">
                                    </label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="items">
                                    <h3>Armor</h3>
                                    <label class="tiny-icon-wrap" title="None" ng-class="{selected: selections.armor === null}">
                                        <input type="radio" name="armor" ng-value="null" ng-model="selections.armor">
                                    </label>
                                    <label ng-repeat="(armor, cost) in ARMOR"
                                            class="tiny-icon-wrap"
                                            title="{{armor | vogName}}"
                                            ng-class="{selected: selections.armor === armor}"
                                            data-cost="{{cost}}">
                                        <div class="icon-{{armor}}"></div>
                                        <input type="radio" name="armor" ng-value="armor" ng-model="selections.armor">
                                    </label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="items">
                                    <h3>Abilities</h3>
                                    <label ng-repeat="(ability, cost) in getPurchaseableAbilities()"
                                            class="tiny-icon-wrap"
                                            title="{{ability | vogName}}"
                                            ng-class="{selected: selections.abilities[ability]}"
                                            data-cost="{{cost}}">
                                        <div class="icon-{{ability}}"></div>
                                        <input type="checkbox" class="icon" ng-model="selections.abilities[ability]"></input>
                                    </label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="items">
                                    <h3>Consumables</h3>
                                    <button ng-repeat="(consumable, cost) in CONSUMABLES track by $index"
                                            class="tiny-icon-wrap"
                                            type="button"
                                            title="{{consumable | vogName}}"
                                            ng-click="addToBackpack(consumable)"
                                            data-cost="{{cost}}">
                                        <div ng-if="isAbilityConsumable(consumable)" class="icon-Scroll"></div>
                                        <div ng-if="isAbilityConsumable(consumable)" class="icon-{{consumable}}"></div>
                                        <div ng-if="!isAbilityConsumable(consumable)" class="icon-{{consumable}}"></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="preview">
                            <character-build-preview
                                build="selections"
                                remove-from-backpack="removeFromBackpack"
                            ></character-build-preview>
                            <span ng-if="getCost() <= getMoney()" class="amount-left">
                                <span class="value">{{getMoney() - getCost()}}</span>
                                <span class="remaining">left</span>
                            </span>
                            <span ng-if="getCost() > getMoney()" class="amount-overspent">
                                <span class="value">{{getCost() - getMoney()}}</span>
                                <span class="remaining">too much</span>
                            </span>
                            <div><input type="submit" ng-disabled="!isBuildLegal()"/></div>
                        </div>
                    </div>
                </div>
            </form>`);
    }]);

let generator;

export default class CharacterBuilder {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            const dialog = document.createElement('dialog');
            dialog.classList.add('character-builder');
            dialog.innerHTML = '<ng-include src="\'character-builder.html\'"></ng-include>';
            document.body.appendChild(dialog);

            if(!dialog.open) {
                dialogPolyfill.registerDialog(dialog);
            }

            promiseHandlers.resolve = (gen) => {
                dialog.open && dialog.close(); // Auto close doesn't always work. Force it. TODO: Find out why
                generator = gen;
                resolve(gen());
            };
            promiseHandlers.reject = reject;

            angular.bootstrap(dialog, ['vog']);

            dialog.showModal();
        });
    }

    getCharacter() {
        return this._promise;
    }

    static copyLastCharacter() {
        return Promise.resolve(generator());
    }
}
