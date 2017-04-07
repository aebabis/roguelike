import GameEvents from '../events/GameEvents.js';

const SPEEDUP_RATE = 5;
const ENEMY_ANIMATIONS_DELAYED = false;

export default class PixiAnimationController {
    constructor(sharedData, pixiDungeonView, pixiApp, animationPack) {
        this._sharedData = sharedData;
        this._pixiDungeonView = pixiDungeonView;
        this._animationPack = animationPack;
        this._stage = pixiApp.stage;
        const queue = this._animationGroupQueue = [[]];

        pixiApp.ticker.add((delta) => {
            const isBehind = queue.length > 1;
            const speedup = isBehind ? SPEEDUP_RATE : 1;
            const currentAnimationGroup = this.getCurrentAnimationGroup();
            if(currentAnimationGroup) {
                if(!currentAnimationGroup.started) {
                    currentAnimationGroup.forEach(animation => {
                        animation.start();
                        animation.advance(0);
                    });
                    currentAnimationGroup.started = true;
                }
                const newAnimationGroup = currentAnimationGroup.filter(
                    animation => animation.advance(speedup * delta)
                );
                if(newAnimationGroup.length === 0 && queue.length > 1) {
                    queue.shift();
                } else {
                    queue[0] = newAnimationGroup;
                }
            }
        });
    }

    getAnimationPack() {
        return this._animationPack;
    }

    flush() {
        this._animationGroupQueue = [[]];
    }

    getCurrentAnimationGroup() {
        return this._animationGroupQueue[0];
    }

    getLastAnimationGroup() {
        const list = this._animationGroupQueue;
        return list[list.length - 1];
    }

    createAnimationGroup() {
        const group = [];
        this._animationGroupQueue.push(group);
        return group;
    }

    handleGameEvent(event) {
        if(event instanceof GameEvents.HumanMovingEvent) {
            this.createAnimationGroup();
        }
        const currentAnimationGroup = this.getLastAnimationGroup();
        const animation = this.getAnimationPack().getAnimation(this._sharedData, this._pixiDungeonView, event);
        if(animation) {
            currentAnimationGroup.push(animation);
        }
    }
}