import { default as GameEvent } from "../events/GameEvent.js";

import { default as Weapon } from "../entities/weapons/Weapon.js";

import { default as ItemDomFactory } from "./ItemDomFactory.js";

import { default as Move } from "../entities/creatures/moves/Move.js";

export default class AbilitiesView {
    /**
     * @class AbilitiesView
     * @description List view for the player's abilities
     */
    constructor(sharedData) {
        var self = this;
        var dom = this._dom = $('<div class="sidebar-subcontainer abilities">');
        this._sharedData = sharedData;

        sharedData.addObserver((event)=>this.update());

        $(dom).on('click', 'button', function() {
            var index = +$(this).attr('data-index');
            var prevAbility = sharedData.getTargettedAbility();

            if(prevAbility === index) {
                sharedData.unsetTargettedAbility();
            } else {
                var dungeon = sharedData.getDungeon();
                var player = dungeon.getPlayableCharacter();
                var ability = player.getAbilities()[index];
                if(ability.isTargetted()) {
                    sharedData.setTargettedAbility(index);
                } else {
                    player.setNextMove(new Move.UseAbilityMove(index));
                }
            }
        });
    }

    update() {
        var sharedData = this._sharedData;
        var dungeon = sharedData.getDungeon();
        var player = dungeon.getPlayableCharacter();
        var targettedIndex = sharedData.getTargettedAbility();
        var template = $(`
        <h2>Abilities</h2>
        <div class="wrap">
            ${player.getAbilities().map((item, index)=>
                    `<button class="ability" data-index="${index}" data-targetting="${targettedIndex === index}">${item.getName()} (${item.getManaCost()} mana)</button>`)}
        </div>`);
        $(this.getDom()).empty().append(template);
    }

    getDom() {
        return this._dom[0];
    }
}
