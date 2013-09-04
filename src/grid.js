/*
 * Copyright (c) 2013 Omniscale
 * Published under the MIT license.
 */

/** BBOX.
 * @name BBox
 *
 * @constructor
 * @param minx {float}
 * @param miny {float}
 * @param maxx {float}
 * @param maxy {float}
 */
Seed.BBox = function(minx, miny, maxx, maxy) {
    this.minx = minx;
    this.miny = miny;
    this.maxx = maxx;
    this.maxy = maxy;
};


Seed.BBox.prototype = {
    size: function() {
        return [this.maxx - this.miny, this.maxy - this.miny];
    }
};


Seed.DefaultBBox = new Seed.BBox(
    -20037508.342789244,
    -20037508.342789244,
    20037508.342789244,
    20037508.342789244
);

/** Grid describes how tiles are aligned.
 *
 * This grid only supports a OSM/Google Maps compatible grid in EPSG:3857,
 * with a tile size of 256x256 and origin in north/west.
 *
 * @constructor
 */
Seed.Grid = function() {
    this.resolutions = [];
    this.tileSize = [256, 256];
    this.bbox = Seed.DefaultBBox;

    var res = this.bbox.size()[0] / 256;
    for (var i = 0; i < 20; i++) {
        this.resolutions.push(res);
        res = res/2.0;
    };
};

Seed.Grid.prototype = {
    /** Return BBOX of the tile.
     *
     * @param x {int} - x tile coordinate
     * @param y {int} - y tile coordinate
     * @param z {int} - zoom level
     * @returns {BBox} - BBOX of the tile
     */
    tileBBox: function(x, y, z) {
        var res = this.resolutions[z];

        var x0 = this.bbox.minx + (x * res * this.tileSize[0]);
        var x1 = x0 + (res * this.tileSize[0]);

        var y1 = this.bbox.maxy - (y * res * this.tileSize[1]);
        var y0 = y1 - (res * this.tileSize[1]);

        return new Seed.BBox(x0, y0, x1, y1);
    },

    /**
     * Return tile coordinate in given level.
     *
     * @param x {int} - x/long coordinate in EPSG:3857
     * @param y {int} - y/lat coordinate in EPSG:3857
     * @param level {int} - zoom level
     */
    tile: function(x, y, level) {
        var res = this.resolutions[level];
        x = x - this.bbox.minx;
        y = this.bbox.maxy - y;

        var tileX = x / (res * this.tileSize[0]);
        var tileY = y / (res * this.tileSize[1]);
        return [Math.floor(tileX), Math.floor(tileY), level];
    },

    /**
     * Get all tiles that intersects a bbox at given level.
     *
     * @param level {array}
     * @param bbox {BBox}
     * @returns {TileIter} - iterator over all affected tiles
     */
    affectedTiles: function(level, bbox) {
        if (bbox == undefined) {
            bbox = this.bbox;
        }

        var delta = this.resolutions[level] / 10.0;
        ul = this.tile(bbox.minx + delta, bbox.maxy - delta, level);
        lr = this.tile(bbox.maxx - delta, bbox.miny + delta, level);

        return new Seed.TileIter(ul[0], ul[1], lr[0], lr[1], level);
    },

    /**
     * Estimate the number of tiles that intersect the bbox.
     *
     * @param bbox {BBox}
     * @param levels {array} - start and end level
     * @returns {int} - number of tiles
     */
    estimateTiles: function(bbox, levels) {
        var tiles = 0;
        for (var level = levels[0]; level <= levels[1]; level++) {
            var affected = this.affectedTiles(level, bbox);
            tiles += affected.numTiles[0] * affected.numTiles[1];
        };
        return tiles;
    }

};

/**
 * Iterator over a set of tiles.
 *
 * @constructor
 * @property numTiles {int} - total number of tiles this iterator returns
 */
Seed.TileIter = function(x0, y0, x1, y1, level) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.level = level;
    this.numTiles = [x1 - x0 + 1, y1 - y0 + 1];

    this.currentX = x0 - 1;
    this.currentY = y0;
};

Seed.TileIter.prototype = {
    /**
     * Return next tile.
     *
     * @returns {array|null} - array with x, y and level of the tile
     *     or null if the iterator stopped
     */
    next: function() {
        this.currentX += 1;

        if (this.currentX > this.x1) {
            this.currentX = this.x0;
            this.currentY += 1;
        }
        if (this.currentY > this.y1) {
            return null;
        }

        return [this.currentX, this.currentY, this.level];
    },
    foreach: function(func) {
        for (var tile = this.next(); tile !== null; tile = this.next()) {
            func(tile);
        }
    }
};
