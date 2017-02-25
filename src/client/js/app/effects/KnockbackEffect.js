/**
 * An effect that can be used to push a creature.
 */
export default class KnockbackEffect {
    /**
     * Creates a knockback effect without applying it.
     * @param {number} distance - The maximum distance the target
     * can be pushed
     */
    constructor(distance) {
        if(+distance !== 1) {
            throw new Error('Unsupported value: ' + distance);
        }
        this._distance = +distance;
    }

    /**
     * Pushes the target back until they fly the effect's distance
     * or are stopped by a solid obstacle
     * @param {Dungeon} dungeon - The dungeon the creatures are in
     * @param {Creature} source - The creature that created the effect
     * @param {Creature} target - The creature getting pushed
     */
    apply(dungeon, source, target) {
        const sourceTile = dungeon.getTile(source);
        const targetTile = dungeon.getTile(target);
        const dx = Math.sign(targetTile.getX() - sourceTile.getX());
        const dy = Math.sign(targetTile.getY() - sourceTile.getY());
        const x = targetTile.getX() + dx;
        const y = targetTile.getY() + dy;
        const tile = dungeon.getTile(x, y);
        if(!tile.isSolid() && !tile.getCreature()) {
            dungeon.moveCreature(target, x, y, this);
            return true;
        } else {
            return false;
        }
    }
}
