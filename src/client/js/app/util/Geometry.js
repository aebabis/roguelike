const Geometry = {
    /**
     * @function orientation
     * @description Determines the cross-product orientation of three points.
     * Doesn't handle colinearity because the game doesn't need it.
     */
    orientation: function(p0, p1, p2) {
        return Math.sign((p1.y - p0.y) * (p2.x - p1.x) - (p1.x - p0.x) * (p2.y - p1.y));
    },

    /**
     * @function intersects
     * @description Determines if two line segements intersect. Does not
     * handle edge cases because the game doesn't need them
     */
    intersects: function (p0, q0, p1, q1) {
        return Geometry.orientation(p0, q0, p1) !== Geometry.orientation(p0, q0, q1)
                && Geometry.orientation(p1, q1, p0) !== Geometry.orientation(p1, q1, q0);
    }
};

export default Geometry;
