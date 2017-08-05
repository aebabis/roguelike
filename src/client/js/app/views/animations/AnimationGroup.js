import Animation from './Animation';

export default class AnimationGroup extends Animation {
    constructor(animations) {
        super();
        this._animations = animations;
    }

    start() {
        this._animations.forEach(animation => animation.start());
        super.start();
    }

    hasStarted() {
        const animations = this._animations;
        return animations.length === 0 || animations[0].hasStarted();
    }

    advance() {
    }

    onTick(delta) {
        this._animations.forEach(animation => animation.onTick(delta));
    }

    hasEnded() {
        const animations = this._animations;
        return animations.length === 0 || animations[0].hasEnded();
    }
}
