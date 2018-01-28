const visionLookup = {};

const Geometry = {
    /**
     * @function orientation
     * @description Determines the cross-product orientation of three points.
     * Doesn't handle colinearity because the game doesn't need it.
     */
    orientation(p0, p1, p2) {
        return Math.sign((p1.y - p0.y) * (p2.x - p1.x) - (p1.x - p0.x) * (p2.y - p1.y));
    },

    /**
     * @function intersects
     * @description Determines if two line segements intersect. Does not
     * handle edge cases because the game doesn't need them
     */
    intersects(p0, q0, p1, q1) {
        return Geometry.orientation(p0, q0, p1) !== Geometry.orientation(p0, q0, q1)
                && Geometry.orientation(p1, q1, p0) !== Geometry.orientation(p1, q1, q0);
    },

    /**
     * @function tilesAlongLine
     * @description Gets a list of tiles along the line from <0, 0> to <dx, dy>
     */
    tilesAlongLine(dx, dy) {
        let checkList = visionLookup[dx + ',' + dy];
        if(!checkList) {
            // Compute sequence of tiles intersected by delta line.
            // Delta line is transformed to start at 0,0 to improve
            // chance of cache hit in the future
            checkList = [];

            const xDir = Math.sign(dx);
            const yDir = Math.sign(dy);
            const targetSlopeX = dx - xDir;
            const targetSlopeY = dy - yDir;

            // Algorithm uses a cursor which traces path by
            // moving along tile edges
            let cursorX = xDir;
            let cursorY = yDir;

            while(Math.abs(cursorX) < Math.abs(dx) ||
                    Math.abs(cursorY) < Math.abs(dy)) {
                checkList.push({
                    dx: cursorX,
                    dy: cursorY
                });

                // Compare cursor slope to LOS slope.
                // If larger, we need to travel along x-axis
                // If smaller, travel along y-axis
                // If equal, do both
                // Use cross-product for efficiency
                const cursorCross = cursorY * targetSlopeX;
                const targetCross = cursorX * targetSlopeY;

                if(Math.abs(cursorCross) >= Math.abs(targetCross)) { // cursorSlope >= targetSlope
                    cursorX += xDir;
                }
                if(Math.abs(cursorCross) <= Math.abs(targetCross)) { // cursorSlope <= targetSlope
                    cursorY += yDir;
                }
            }

            visionLookup[dx + ',' + dy] = checkList;
        }
        return checkList;
    }
};

export default Geometry;
