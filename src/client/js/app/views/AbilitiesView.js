import GameEvent from "../events/GameEvent.js";

import Weapon from "../entities/weapons/Weapon.js";

import ItemDomFactory from "./ItemDomFactory.js";

import Move from "../entities/creatures/moves/Move.js";

export default class AbilitiesView {
    /**
     * @class AbilitiesView
     * @description List view for the player's abilities
     */
    constructor(sharedData) {
        var self = this;
        var dom = this._dom = $('<div class="abilities-buttons">');
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
                    player.setNextMove(new Move.UseAbilityMove(dungeon.getTile(player), index));
                }
            }
        });

        window.addEventListener('keypress', function(event) {
            var code = event.keyCode;
            if(48 <= code && code <= 57) {
                var index = (code + 1) % 10; // '0' key means 10th index
                $(dom).find('button').eq(index).trigger('click');
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
                    `<button class="ability" data-index="${index}" data-targetting="${targettedIndex === index}" data-name="${item.getName()}">
                        <div class="inner">
                            <span class="name">${item.getName()}</span>
                            <span class="cost">${item.getManaCost()}<span class="screenreader"> mana</span></span>
                            <span class="hotkey">${index + 1}</span>
                        </div>
                    </button>`).join('')}
        </div>`);
        $(this.getDom()).empty().append(template);
    }

    getDom() {
        return this._dom[0];
    }
}
