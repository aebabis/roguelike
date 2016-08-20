function getMonsterDom(monster) {
    const name = monster.getName();
    const hp = monster.getCurrentHP();
    const hpPercentage = hp * 100 / hp;
    const baseHP = monster.getBaseHP();
    const mana = monster.getCurrentMana();
    const baseMana = monster.getBaseMana();
    const manaPercentage = mana * 100 / baseMana;
    const time = monster.getTimeToNextMove();
    const speed = monster.getSpeed();
    const speedPercentage = time * 100 / speed;

    return `<div class="monster stat-block">
        <h2>${name}</h2>
        <div class="bar hp" title="Hitpoints">
            <span class="text">${hp} / ${baseHP}</span>
            <div class="inner" style="width: ${hpPercentage}%"></div>
        </div>
        <div class="bar mana" title="Mana" data-has-mana="${baseMana > 0}">
            <div class="inner" style="width: ${manaPercentage}%"></div>
            <span class="text">${mana} / ${baseMana}</span>
        </div>
        <div class="bar action" title="Ticks to Next Move">
            <div class="inner" style="width: ${speedPercentage}%"></div>
            <span class="text">${time} / ${speed}</span>
        </div>
        <div class="equipment">
        </div>
    </div>`;
}

export default {
    bindTooltips: function(sharedData, grid) {
        const $grid = $(grid);
        if(!$grid.tooltip) {
            return; // TODO: Give unit tests access to jQuery UI
        }
        $grid.attr('title', 'Hi').tooltip({
            content: function() {
                const dungeon = sharedData.getDungeon();
                const $cell = $(this);
                const x = +$cell.attr('data-x');
                const y = +$cell.attr('data-y');
                const tile = dungeon.getTile(x, y);
                const creature = tile.getCreature();
                const items = tile.getItems();

                const pc = dungeon.getPlayableCharacter();
                const pcHasSeenTile = pc.hasSeen(tile);
                const pcCanSeeTile = pc.canSee(dungeon, tile);

                if(!pcHasSeenTile) {
                    return null;
                } else {
                    return $(`
                        <div class="tooltip-wrap">
                            <div class="tile">${tile.getName()}</div>
                            ${
                                (creature && pcCanSeeTile) ? (
                                    (creature === pc) ? 'You are here' : getMonsterDom(creature)
                                ) : ''
                            }
                            ${
                                (items.length > 0) ? `
                                    <ul class="items">
                                        ${items.map((item)=>`<ul>${item.getName()}</ul>`)}
                                    </ul>` : ''
                            }
                        </div>
                    `);
                }
            },

            items: '.cell',

            tooltipClass: 'grid-tooltip',

            position: {
                my: 'left+15 top+5',
                at: 'right top'
            },

            show: {
                delay: 400
            }/*,

            close: function( event, ui ) {
                ui.tooltip.hover(function () {
                    $(this).stop(true).fadeTo(400, 1);
                    //.fadeIn("slow"); // doesn't work because of stop()
                }, function () {
                    $(this).fadeOut(400, function(){ $(this).remove(); });
                });
            }*/
        }).on('click tap', function() {
            $grid.tooltip('disable');
        }).on('mousemove focus', function() {
            $grid.tooltip('enable');
        });
    }
};
