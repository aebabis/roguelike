import TransitionAnimation from './TransitionAnimation';

export default class ProjectileAnimation extends TransitionAnimation {
    constructor(duration = 30, {
        pixiDungeonView,
        sprite,
        dungeon,
        attacker,
        target
    }) {
        const TILE_WIDTH = pixiDungeonView.getTileWidth();
        const stage = pixiDungeonView.getStage();
        const startX = () => (dungeon.getTile(attacker).getX() + .5) * TILE_WIDTH;
        const startY = () => (dungeon.getTile(attacker).getY() + .5) * TILE_WIDTH;
        const endX = () => (dungeon.getTile(target).getX() + .5) * TILE_WIDTH;
        const endY = () => (dungeon.getTile(target).getY() + .5) * TILE_WIDTH;
        const rotation = () => Math.atan2(endY() - startY(), endX() - startX());
        super(duration, {
            group: sprite,
            properties: {
                x: { start: startX, end: endX },
                y: { start: startY, end: endY },
                rotation: { start: rotation, end: rotation }
            },
            onStart: () => stage.addChild(sprite),
            onEnd: () => stage.removeChild(sprite)
        });
    }
}
