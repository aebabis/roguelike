import Animation from './Animation';

const TIME = 40;

/**
 * Animates sliding, floating text on the dungeon canvas
 */
export default class FloatingTextAnimation extends Animation {
    /**
     * Creates a FloatingTextAnimation using the given Text object
     * @param {*} pixiDungeonView 
     * @param {*} text 
     * @param {*} options 
     */
    constructor(pixiDungeonView, text, options) {
        super(TIME);
        this._pixiDungeonView = pixiDungeonView;
        this._text = text;
        this._options = Object.assign({}, options);
    }

    /**
     * @override
     */
    onStart() {
        this._pixiDungeonView.addParticle(this._text);
    }

    /**
     * @override
     */
    onEnd() {
        this._text.parent.removeChild(this._text);
    }

    /**
     * @override
     */
    advance(delta, cumulativeTime, proportion) {
        const text = this._text;
        const {x, y, xOffset} = this._options;
        const tileWidth = this._pixiDungeonView.getTileWidth();

        text.x = (x + .5 + xOffset) * tileWidth;
        const startY = (y + .5) * tileWidth;
        const endY = y * tileWidth;
        text.y = Animation.interpolate(startY, endY, proportion);
    }
}
