import GameEvents from '../events/GameEvents.js';

const SPEEDUP_RATE = 5;
const ENEMY_ANIMATIONS_DELAYED = false;

export default class PixiAnimationController {
    constructor(pixiApp, animationPack) {
        this._animationPack = animationPack;
        this._stage = pixiApp.stage;
        const queue = this._animationGroupQueue = [[]];

        pixiApp.ticker.add(function(delta) {
            const isBehind = queue.length > 1;
            const modifiedDelta = isBehind ? SPEEDUP_RATE : 1;
            const currentAnimationGroup = queue[0];
            if(currentAnimationGroup) {
                currentAnimationGroup.forEach((animation) => {
                    if(!animation.isDone()) {
                        animation.advance(modifiedDelta);
                    }
                });
                if(currentAnimationGroup.every(animation => animation.isDone())) {
                    queue.shift();
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

    handleGameEvent(event) {
        const queue = this._animationGroupQueue;
        if(event instanceof GameEvents.HumanMovingEvent) {
            queue.push([]);
        }
        const currentAnimationGroup = queue[queue.length - 1];
        const animation = this.getAnimationPack().getAnimation(event, this._stage);
        if(animation) {
            currentAnimationGroup.push(animation);
        }
    }
}