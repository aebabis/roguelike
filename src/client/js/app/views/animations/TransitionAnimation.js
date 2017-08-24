import Animation from './Animation';

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

    start() {
        if(typeof this._group === 'function') {
            this._group = this._group();
        }
        this._properties = Object.entries(this._properties).reduce((properties, [key, {start, end}]) => {
            // Property value determination may be deferred until the animation starts.
            // This makes it possible to chain interpolated animations without
            // knowing their start and end times.
            if(typeof start === 'function') start = start();
            if(typeof end === 'function') end = end();
            return Object.assign(properties, {
                [key]: {start, end}
            });
        }, {});
        super.start();
    }

    advance(delta, cumulativeTime, proportion) {
        const group = this._group;
        const properties = this._properties;
        const easing = this._easing;
        const displacement = easing(proportion);
        Object.entries(properties).forEach(([key, {start, end}]) => {
            group[key] = Animation.interpolate(start, end, displacement);
        });
    }
}
