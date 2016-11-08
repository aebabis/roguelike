import Classes from '../entities/creatures/classes/Classes.js';

import Abilities from '../abilities/Abilities.js';
import Armors from '../entities/armor/Armors.js';
import Consumables from '../entities/consumables/Consumables.js';
import Weapons from '../entities/weapons/Weapons.js';

import AbilityConsumable from '../entities/consumables/AbilityConsumable.js';

var dialogPolyfill = require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.js');
require('../../../../../node_modules/dialog-polyfill/dialog-polyfill.css');

const angular = require('angular');

var Purchaseables = Object.assign({}, Abilities, Armors, Consumables, Weapons);

const promiseHandlers = {};

const CHARACTERS = {
    Fighter: 70,
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

function getStartingAbilities(className) {
    switch(className) {
    case 'Fighter': return ['DashAttack'];
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
            const { build: {character, abilities } } = this;
            return getStartingAbilities(character).concat(this.getSelectedAbilityNames());
        };
    },
    templateUrl: 'character-build.html'
})
.controller('character-builder', ['$scope', 'promiseHandlers', function($scope, promiseHandlers) {
    const { resolve, reject } = promiseHandlers;

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

    $scope.selectLastBuild = function(index) {
        $scope.selections = $scope.lastBuild;
    }

    $scope.selectPrebuilt = function(index) {
        $scope.selections = $scope.prebuilts[index];
    }

    let isBuilderVisible = false;
    $scope.isBuilderVisible = () => isBuilderVisible;
    $scope.showBuilder = () => isBuilderVisible = true;

    $scope.getSelectedAbilityNames = function() {
        return Object.keys(ABILITIES).filter((ability)=>$scope.selections.abilities[ability]);
    }

    $scope.getAbilities = function() {
        const { selections } = $scope;
        switch(selections.character) {
        case 'Fighter': return ['DashAttack'].concat($scope.getSelectedAbilityNames());
        case 'Wizard': return ['ForceDart'].concat($scope.getSelectedAbilityNames());
        case 'Rogue': return ['Leap'].concat($scope.getSelectedAbilityNames());
        }
    }

    $scope.getConsumableName = function(consumable) {
        return consumable in Abilities ? `${consumable}_Consumable` : consumable;
    }

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
    }

    $scope.isBuildLegal = function() {
        return $scope.getCost() <= $scope.getMoney();
    };

    $scope.submit = function() {
        const { selections } = $scope;
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

        localStorage.lastBuild = JSON.stringify(selections);

        resolve(character);
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
    $templateCache.put('character-builder.html',
        `<form method="dialog" class="gitrecht" ng-controller="character-builder" ng-submit="submit()">
            <h2>Select Character</h2>
            <div class="prebuilts">
                <div class="group" ng-if="lastBuild">
                    <h3>Most Recent</h3>
                    <button>
                        <character-build build="lastBuild" ng-click="selectLastBuild()"></character-build>
                    </button>
                </div>
                <div class="group">
                    <button ng-repeat="build in prebuilts">
                        <character-build build="build" ng-click="selectPrebuilt($index)"></character-build>
                    </button>
                </div>
            </div>
            <button type="button" ng-if="!isBuilderVisible()" ng-click="showBuilder()">Make a Build</button>
            <div class="builder" ng-if="isBuilderVisible()">
                <div class="col">
                    <div class="items">
                        <h3>Character</h3>
                        <label ng-repeat="(character, money) in CHARACTERS" class="icon" data-class-name="{{character}}" title="{{character | vogName}}" ng-class="{selected: selections.character === character}">
                            <input type="radio" name="melee" value="{{character}}" ng-model="selections.character" ng-click="fixAbilities()">
                        </label>
                    </div>
                </div>
                <div class="col">
                    <div class="items">
                        <h3>Melee Weapon</h3>
                        <label ng-repeat="(weapon, cost) in MELEE_WEAPONS"
                               class="icon" data-item-name="{{weapon}}"
                               title="{{weapon | vogName}}"
                               ng-class="{selected: selections.melee === weapon}"
                               data-cost="{{cost}}">
                            <input type="radio" name="melee" ng-value="weapon" ng-model="selections.melee">
                        </label>
                    </div>
                </div>
                <div class="col">
                    <div class="items">
                        <h3>Ranged Weapon</h3>
                        <label class="icon" data-item-name="None" ng-class="{selected: selections.ranged === null}">
                            <input type="radio" name="ranged" ng-value="null" title="None" ng-model="selections.ranged">
                        </label>
                        <label ng-repeat="(weapon, cost) in RANGED_WEAPONS"
                               class="icon" data-item-name="{{weapon}}"
                               title="{{weapon | vogName}}"
                               ng-class="{selected: selections.ranged === weapon}"
                               data-cost="{{cost}}">
                            <input type="radio" name="ranged" ng-value="weapon" ng-model="selections.ranged">
                        </label>
                    </div>
                </div>
                <div class="col">
                    <div class="items">
                        <h3>Armor</h3>
                        <label class="icon" data-item-name="None" title="None" ng-class="{selected: selections.armor === null}">
                            <input type="radio" name="armor" ng-value="null" ng-model="selections.armor">
                        </label>
                        <label ng-repeat="(armor, cost) in ARMOR"
                               class="icon" data-item-name="{{armor}}"
                               title="{{armor | vogName}}"
                               ng-class="{selected: selections.armor === armor}"
                               data-cost="{{cost}}">
                            <input type="radio" name="armor" ng-value="armor" ng-model="selections.armor">
                        </label>
                    </div>
                </div>
                <div class="col">
                    <div class="items">
                        <h3>Abilities</h3>
                        <label ng-repeat="(ability, cost) in getPurchaseableAbilities()"
                            class="icon" data-item-name="{{ability}}"
                            title="{{ability | vogName}}"
                            ng-class="{selected: selections.abilities[ability]}"
                            data-cost="{{cost}}">
                            <input type="checkbox" class="icon" data-ability-name="{{ability}}" ng-model="selections.abilities[ability]"></input>
                        </label>
                    </div>
                </div>
                <div class="col">
                    <div class="items">
                        <h3>Consumables</h3>
                        <button ng-repeat="(consumable, cost) in CONSUMABLES"
                                type="button" class="icon"
                                data-item-name="{{getConsumableName(consumable)}}"
                                title="{{consumable | vogName}}"
                                ng-click="addToBackpack(consumable)"
                                data-cost="{{cost}}"></button>
                    </div>
                </div>
                <div class="preview">
                    <character-build build="selections"></character-build>
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
        </form>`);
}]);

export default class CharacterBuilder {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            var $dialog = $(`
                <dialog class='character-builder'>
                    <ng-include src="'character-builder.html'"></ng-include>
                </dialog>`).appendTo('body');

            const dialog = $dialog[0];

            if(!dialog.open) {
                dialogPolyfill.registerDialog(dialog);
            }

            promiseHandlers.resolve = resolve;
            promiseHandlers.reject = reject;

            angular.bootstrap(dialog, ['vog']);

            dialog.showModal();
        });
    }

    getCharacter() {
        return this._promise;
    }
}
