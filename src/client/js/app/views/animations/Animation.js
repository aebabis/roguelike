export default class Animation {
    constructor(duration = 30) {
        this._duration = duration;
    }

    start() {
        this._hasStarted = true;
        this._cumulativeTime = 0;
        this.advance(0, 0, 0);
        this.onStart();
    }

    onStart() {
    }

    hasStarted() {
        return !!this._hasStarted;
    }

    onTick(delta) {
        if(!this.hasStarted()) {
            throw new Error('Animation attempted to advance without starting');
        }
        const duration = this._duration;
        const cumulativeTime = Math.min(duration, this._cumulativeTime += delta);
        const proportion = cumulativeTime / duration;
        this.advance(duration, cumulativeTime, proportion);
        if(cumulativeTime === duration) {
            this.onEnd();
            this._hasEnded = true;
        }
    }

    advance(delta, cumulativeTime, proportion) {
        throw new Error('Abstract method not implemented');
    }

    onEnd() {
    }

    hasEnded() {
        return !!this._hasEnded;
    }
}
