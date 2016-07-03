function getMonsterDom(monster) {
    var name = monster.getName();
    var hp = monster.getCurrentHP();
    var hpPercentage = hp * 100 / hp;
    var baseHP = monster.getBaseHP();
    var mana = monster.getCurrentMana();
    var baseMana = monster.getBaseMana();
    var manaPercentage = mana * 100 / baseMana;
    var time = monster.getTimeToNextMove();
    var speed = monster.getSpeed();
    var speedPercentage = time * 100 / speed;

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
    bindTooltips: function(dungeon, grid) {
        var $grid = $(grid);
        if(!$grid.tooltip) {
            return; // TODO: Give unit tests access to jQuery UI
        }
        $grid.attr('title', 'Hi').tooltip({
            content: function() {
                var $cell = $(this);
                var x = +$cell.attr('data-x');
                var y = +$cell.attr('data-y');
                var tile = dungeon.getTile(x, y);
                var creature = tile.getCreature();
                var items = tile.getItems();

                var pc = dungeon.getPlayableCharacter();
                var pcHasSeenTile = pc.hasSeen(tile);
                var pcCanSeeTile = pc.canSee(dungeon, tile);

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
                delay: 1200
            },

            close: function( event, ui ) {
                ui.tooltip.hover(function () {
                    $(this).stop(true).fadeTo(400, 1);
                    //.fadeIn("slow"); // doesn't work because of stop()
                }, function () {
                    $(this).fadeOut(400, function(){ $(this).remove(); });
                });
            }
        });
    }
};
