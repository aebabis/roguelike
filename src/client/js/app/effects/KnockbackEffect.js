export default class KnockbackEffect {
    constructor(distance) {
        if(+distance !== 1) {
            throw new Error('Unsupported value: ' + distance);
        }
        this._distance = +distance;
    }

    apply(dungeon, source, target) {
        var sourceTile = dungeon.getTile(source);
        var targetTile = dungeon.getTile(target);
        var dx = Math.sign(targetTile.getX() - sourceTile.getX());
        var dy = Math.sign(targetTile.getY() - sourceTile.getY());
        var x = targetTile.getX() + dx;
        var y = targetTile.getY() + dy;
        var tile = dungeon.getTile(x, y);
        if(!tile.isSolid() && !tile.getCreature()) {
            dungeon.moveCreature(target, x, y);
            return true;
        } else {
            return false;
        }
    }
}
