const interpolate = (start, end, proportion) => {
    if(typeof start === 'number' && typeof end === 'number') {
        return start + proportion * (end - start);
    }
    throw new Error(`Cannot interpolate between ${start} and ${end}`);
};

const Easings = {
    linear: t => t,
    easeIn: (t) => t*t
};

export default class Animation {
    constructor(duration = 30, {onStart, onEnd, advance} = {}) {
        this._duration = duration;
        if(onStart) {
            this.onStart = onStart;
        }
        if(onEnd) {
            this.onEnd = onEnd;
        }
        if(advance) {
            this.advance = advance;
        }
    }

    static get interpolate() { return interpolate; }
    static get Easings() { return Easings; }

    start() {
        this._hasStarted = true;
        this._cumulativeTime = 0;
        this.onStart();
        this.advance(0, 0, 0);
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

    advance(delta, cumulativeTime, proportion) { // eslint-disable-line no-unused-vars
        throw new Error('Abstract method not implemented');
    }

    onEnd() {
    }

    hasEnded() {
        return !!this._hasEnded;
    }
}
