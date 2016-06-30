import Move from '../entities/creatures/moves/Move.js';

export default class TileView {
    /**
     * @class TileView
     * @description View for providing information about an arbitary tile
     */
    constructor(sharedData) {
        var dom = this._dom = $('<div class="sidebar-subcontainer tile-info">');
        this._sharedData = sharedData;

        sharedData.addObserver(()=>this.update());

        $(dom).on('click', 'button.item', function() {
            var index = $(this).attr('data-index');
            var dungeon = sharedData.getDungeon();
            var player = dungeon.getPlayableCharacter();
            player.setNextMove(dungeon.getTile(player), new Move.TakeItemMove(index));
        });
    }

    update() {
        var template;
        var sharedData = this._sharedData;
        var dungeon = sharedData.getDungeon();
        var location = sharedData.getInspectedTile() || {x: 0, y: 0};
        var tile = dungeon.getTile(location.x, location.y);
        var tileName = tile.getName();
        var creature = tile.getCreature();
        var items = tile.getItems();

        if(!dungeon.getPlayableCharacter().canSee(dungeon, tile)) {
            tileName = 'Unknown';
            creature = null;
            items = [];
        }

        template = $(`
        <h2>${tileName} (${tile.getX()}, ${tile.getY()})</h2>
        <div class="wrap">
            ${
                creature ? `
                <div class="creature">
                    <div class="name">${creature.getName()}</div>
                    <div class="hp">HP: ${creature.getCurrentHP()} / ${creature.getBaseHP()}</div>
                    <div class="action">Action: ${creature.getTimeToNextMove()} / ${creature.getSpeed()}</div>
                </div>` : ''
            }
            <ul class="items">
                ${items.map((item)=>`<li>${item.getName()}</li>`)}
            </ul>
        </div>`);
        $(this.getDom()).empty().append(template);
    }

    getDom() {
        return this._dom[0];
    }
}
