import Animation from './Animation';

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

export default class TransitionAnimation extends Animation {
    constructor(duration = 30, {
        group,
        properties,
        easing = TransitionAnimation.Easings.linear,
        onStart = () => {},
        onEnd = () => {}
    }) {
        super(duration);
        this._group = group;
        this._properties = properties;
        this._easing = easing;
        this.onStart = onStart;
        this.onEnd = onEnd;
    }

    static get Easings() { return Easings; }

    advance(delta, cumulativeTime, proportion) {
        const group = this._group;
        const properties = this._properties;
        const easing = this._easing;
        const displacement = easing(proportion);
        Object.entries(properties).forEach(([key, {start, end}]) => {
            if(typeof start === 'function') start = start();
            if(typeof end === 'function') end = end();
            group[key] = interpolate(start, end, displacement);
        });
    }
}
