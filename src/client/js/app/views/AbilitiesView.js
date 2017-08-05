import Moves from '../entities/creatures/moves/Moves.js';

export default class AbilitiesView {
    /**
     * @class AbilitiesView
     * @description List view for the player's abilities
     */
    constructor(sharedData) {
        const dom = this._dom = document.createElement('div');
        dom.classList.add('abilities-buttons');
        this._sharedData = sharedData;

        sharedData.addObserver(()=>this.update());

        dom.addEventListener('click', ({target}) => {
            if (target.tagName !== 'BUTTON') {
                return;
            }

            const index = +target.getAttribute('data-index');
            const prevAbility = sharedData.getTargettedAbility();

            if(prevAbility === index) {
                sharedData.unsetTargettedAbility();
            } else {
                const dungeon = sharedData.getDungeon();
                const player = dungeon.getPlayableCharacter();
                const ability = player.getAbilities()[index];
                if(ability.isTargetted()) {
                    sharedData.setTargettedAbility(index);
                } else {
                    player.setNextMove(new Moves.UseAbilityMove(dungeon.getTile(player), index));
                }
            }

            document.querySelector('section.game').focus();
        });

        window.addEventListener('keypress', function(event) {
            const code = event.keyCode;
            if(48 <= code && code <= 57) {
                const index = (code + 1) % 10; // '0' key means 10th index
                dom.querySelectorAll('button')[index].click();
            }
        });
    }

    update() {
        const sharedData = this._sharedData;
        const dungeon = sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const targettedIndex = sharedData.getTargettedAbility();
        this.getDom().innerHTML = `
        <h2>Abilities</h2>
        <div class="wrap">
            ${player.getAbilities().map((item, index)=>
                    `<button class="ability" title="${item.getDescription()}" data-index="${index}" data-targetting="${targettedIndex === index}" data-name="${item.getName()}">
                        <div class="inner icon" data-ability-name="${item.toString()}">
                            <span class="name">${item.getName()}</span>
                            <span class="cost">${item.getManaCost()}<span class="screenreader"> mana</span></span>
                            <span class="hotkey">${index + 1}</span>
                        </div>
                    </button>`).join('')}
        </div>`;
    }

    getDom() {
        return this._dom;
    }
}
