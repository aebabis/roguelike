import GameEvents from '../events/GameEvents.js';

function buildRenderingDiv(x, y) {
    return $('<div>').css({
        width: '5em',
        height: '5em',
        position: 'absolute',
        zIndex: 3,
        backgroundSize: '100%',
        top: (y || 0) * 5 + 'em',
        left: (x || 0) * 5 + 'em'
    });
}

function wait(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay);
    });
}

// Animation routines for animations/transitions that
// couldn't be easily handled by pure CSS within a single tile
export default {
    animateEvent: function(dungeon, grid, event) {
        if(event instanceof GameEvents.AbilityEvent) {
            switch(event.getAbility().getName()) {
            case 'Fireball':
                var tile = event.getTile(dungeon);
                var $div = buildRenderingDiv(tile.getX(), tile.getY())
                .appendTo(grid.getDom().querySelector('.grid'))
                .addClass('effect')
                .attr('data-effect-name', 'Fireball')
                .css({
                    pointerEvents: 'none',
                    transition: '.3s transform, .5s opacity',
                    opacity: 1,
                    transform: 'scale(0)'
                });
                wait(50).then(function() {
                    $div.css('transform', 'scale(3)');
                    return wait(300);
                }).then(function() {
                    $div.css('opacity', 0);
                    return wait(1000);
                }).then(function() {
                    $div.remove();
                });
                break;
            }
        }
    },

    animateProjectile: function(dungeon, grid, cause, from, to) {
        var x1 = from.getX();
        var y1 = from.getY();
        var x2 = to.getX();
        var y2 = to.getY();
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        $(`<div class="projectile" data-projectile-name="${cause.toString()}">`).appendTo(grid.children[0])
            .css({
                left: `${x1 * 5}em`,
                top: `${y1 * 5}em`,
                transform: `rotate(${angle.toFixed()}deg)`
            })
            .animate({
                left: `${x2 * 5}em`,
                top: `${y2 * 5}em`
            }, 200, function() {
                $(this).remove();
            });
    }
};
