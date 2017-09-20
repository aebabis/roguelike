import GameEvents from '../events/GameEvents.js';
import Dungeon from '../dungeons/Dungeon.js';
import PlayableCharacter from '../entities/creatures/PlayableCharacter.js';
import Animation from './animations/Animation';

const SPEEDUP_RATE = 2;
const GAME_TICKS_PER_FRAME = 1000 / 60;

export default class PixiAnimationController {
    constructor(sharedData, pixiDungeonView, pixiApp, animationPack) {
        this._sharedData = sharedData;
        this._pixiDungeonView = pixiDungeonView;
        this._animationPack = animationPack;

        this._simTime = 0;
        this._animationQueue = [];
        this._currentAnimations = [];

        this.bindToDungeonStream();

        pixiApp.ticker.add((delta) => {
            const dungeon = sharedData.getDungeon();
            if(!dungeon) {
                return;
            }
            const simTime = this._simTime;
            const animations = this._currentAnimations;
            const queue = this._animationQueue;
            while(queue[0] && queue[0].time <= this._simTime) {
                animations.push(queue.shift());
            }
            let isBehind;
            if(queue.length === 0) {
                isBehind = this._isBehind = false;
            } else if(queue.findIndex(({isPlayerMoveEvent}) => isPlayerMoveEvent) !== -1) {
                isBehind = this._isBehind = true;
            } else {
                isBehind = this._isBehind;
            }
            const speedup = isBehind ? SPEEDUP_RATE : 1;
            // Pixi uses 60 frame per second
            // Game uses 1000 ticks per in-game second.
            // We have to convert between the two when
            // advancing animations
            const animationDelta = speedup * delta;
            const simDelta = animationDelta * GAME_TICKS_PER_FRAME;
            this._currentAnimations = animations.filter(entry => {
                const { animation } = entry;
                if(!animation.hasStarted()) {
                    animation.start();
                }
                animation.onTick(animationDelta);
                return !animation.hasEnded();
            });
            this._simTime = Math.min(simTime + simDelta, dungeon.getCurrentTimestep());
        });
    }

    getAnimationPack() {
        return this._animationPack;
    }

    bindToDungeonStream() {
        if(this._subscription) {
            this._subscription.unsubscribe;
        }
        const dungeon = this._sharedData.getDungeon();
        if(dungeon) {
            this._subscription = dungeon.getEventStream().subscribe(event => {
                const animation = this.getAnimationPack().getAnimation(this._sharedData, this._pixiDungeonView, event);
                if(animation) {
                    const isPlayerMoveEvent = event instanceof GameEvents.PositionChangeEvent && event.getCreature() instanceof PlayableCharacter;
                    this._animationQueue.push({
                        animation,
                        time: event.getTimestamp(),
                        // If multiple HumanMovingEvents are in the queue,
                        // the player is pathing and the animation should be sped up
                        isPlayerMoveEvent
                    });
                }
            });
        }
    }

    handleGameEvent(event) {
        if(event instanceof Dungeon) {
            // Sim time is used to determine when animations can be dequeued
            this._simTime = event.getCurrentTimestep();
            // Animations with the same game clock timestamp are bucketed
            this._animationQueue = [];
            this.bindToDungeonStream();
        }
    }
}