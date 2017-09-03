export default class PlayerLocationView {
    /**
     * View summarizing the tile where the player is standing
     */
    constructor(sharedData) {
        const dom = this._dom = document.createElement('div');
        dom.classList.add('player-location-view');
        this._sharedData = sharedData;

        sharedData.addObserver(()=>this.update());
    }

    update() {
        const sharedData = this._sharedData;
        const dungeon = sharedData.getDungeon();
        if(!dungeon) {
            return;
        }
        const player = dungeon.getPlayableCharacter();
        const tile = dungeon.getTile(player);

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
                name: item.toString(),
                index: index
            };
        });

        this.getDom().innerHTML = `
        <div role="presentation" class="portrait md-icon-wrap">
            <div class="icon-${player.toString()}"></div>
        </div>
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
            ${items.map((item)=>`<div class="sm-icon-wrap"><div class="icon-${item.name}"></div></div>`).join('')}
        </div>`;
    }

    getDom() {
        return this._dom;
    }
}
