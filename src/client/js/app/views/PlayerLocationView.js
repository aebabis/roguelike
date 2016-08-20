import Moves from '../entities/creatures/moves/Moves.js';

export default class PlayerLocationView {
    /**
     * @class PlayerLocationView
     * @description View summarizing the tile where the player is standing
     */
    constructor(sharedData) {
        const dom = this._dom = $('<div class="player-location-view">');
        this._sharedData = sharedData;

        sharedData.addObserver(()=>this.update());

        $(dom).on('click tap', 'button.item', function() {
            const index = $(this).attr('data-index');
            const dungeon = sharedData.getDungeon();
            if(dungeon) {
                const player = dungeon.getPlayableCharacter();
                player.setNextMove(dungeon.getTile(player), new Moves.TakeItemMove(index));
                dungeon.resolveUntilBlocked();
            }
        });
    }

    update() {
        const sharedData = this._sharedData;
        const dungeon = sharedData.getDungeon();
        const player = dungeon.getPlayableCharacter();
        const tile = dungeon.getTile(player);

        /*const tileName = tile.constructor.name;
        const x = tile.getX();
        const y = tile.getY();*/

        const name = player.constructor.name;
        const hp = player.getCurrentHP();
        const baseHP = player.getBaseHP();
        const hpPercentage = Math.max(0, hp * 100 / baseHP);
        const mana = player.getCurrentMana();
        const baseMana = player.getBaseMana();
        const manaPercentage = Math.max(0, mana * 100 / baseMana);
        const time = player.getTimeToNextMove();
        const speed = player.getSpeed();
        const speedPercentage = Math.max(0, time * 100 / speed);

        const items = tile.getItems().map(function(item, index) {
            return {
                name: item.getName(),
                index: index,
                takeable: !(new Moves.TakeItemMove(tile, index).getReasonIllegal(dungeon, player))
            };
        });

        const template = $(`
        <div role="presentation" class="portrait"></div>
        <div class="stat-block player">
            <h2>${name}</h2>
            <div class="bar hp" title="Hitpoints">
                <span class="text">${hp} / ${baseHP}</span>
                <div class="inner" style="width: ${hpPercentage}%"></div>
            </div>
            <div class="bar mana" title="Mana" data-has-mana="${baseMana > 0}">
                <div class="inner" style="width: ${manaPercentage}%"></div>
                <span class="text">${mana} / ${baseMana}</span>
            </div>
            <!--div class="bar action" title="Ticks to Next Move">
                <div class="inner" style="width: ${speedPercentage}%"></div>
                <span class="text">${time} / ${speed}</span>
            </div-->
        </div>
        <div class="items">
            ${items.map((item)=>`
                <button class="item"
                    ${item.takeable ? '' : 'disabled'}
                    data-index="${item.index}">${item.name}
                </button>`)}
        </div>`);

        $(this.getDom()).empty().append(template);
    }

    getDom() {
        return this._dom[0];
    }
}
