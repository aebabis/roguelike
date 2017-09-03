import Animation from './Animation';
export default class SingleFrameAnimation extends Animation {
    constructor(action) {
        super(0);
        this._action = action;
    }

    onStart() {
        this._action();
    }

    advance(delta, cumulativeTime, proportion) { // eslint-disable-line no-unused-vars
    }
}
