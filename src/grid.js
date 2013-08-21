
var Seed = {};

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
    tileBBox: function(x, y, z) {
        var res = this.resolutions[z];

        var x0 = this.bbox.minx + (x * res * this.tileSize[0]);
        var x1 = x0 + (res * this.tileSize[0]);

        var y1 = this.bbox.maxy - (y * res * this.tileSize[1]);
        var y0 = y1 - (res * this.tileSize[1]);

        return new Seed.BBox(x0, y0, x1, y1);
    },

    tile: function(x, y, level) {
        var res = this.resolutions[level];
        x = x - this.bbox.minx;
        y = this.bbox.maxy - y;

        var tileX = x / (res * this.tileSize[0]);
        var tileY = y / (res * this.tileSize[1]);
        return [Math.floor(tileX), Math.floor(tileY), level];
    },

    affectedTiles: function(level, bbox) {
        if (bbox == undefined) {
            bbox = this.bbox;
        }

        var delta = this.resolutions[level] / 10.0;
        ul = this.tile(bbox.minx + delta, bbox.maxy - delta, level);
        lr = this.tile(bbox.maxx - delta, bbox.miny + delta, level);

        return {
            'numTiles': [lr[0] - ul[0] + 1, lr[1] - ul[1] + 1],
            'tiles': new Seed.TileIter(ul[0], ul[1], lr[0], lr[1], level)
        }
    }
};

Seed.TileIter = function(x0, y0, x1, y1, level) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.level = level;

    this.currentX = x0 - 1;
    this.currentY = y0;

    console.log(this.currentX, this.currentY)
};

Seed.TileIter.prototype = {
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
