Seed.Source = {};

Seed.Source.WMTSSource = function(url) {
    this.url = url;
};

Seed.Source.WMTSSource.prototype = {
    fetchTile: function(tile, success) {
        var url = this.url;
        url = url.replace(/\{TileCol\}/, tile[0]);
        url = url.replace(/\{TileRow\}/, tile[1]);
        url = url.replace(/\{TileMatrix\}/, tile[2]);

        Seed.Util.fetchTileURL(url, tile, success);
    }
};

Seed.Source.WMSSource = function(url) {
    this.url = url;
    this.grid = new Seed.Grid();
};

Seed.Source.WMSSource.prototype = {
    fetchTile: function(tile, success) {

        var bbox = this.grid.tileBBox(tile[0], tile[1], tile[2]);
        bbox = bbox.minx + "," + bbox.miny + "," + bbox.maxx + "," +  bbox.maxy;

        var url = this.url;
        url = url.replace(/\{BBOX\}/, bbox);

        Seed.Util.fetchTileURL(url, tile, success);
    }
};


Seed.Source.TestSource = function(url) {
    this.url = url;
    this.fetchedTiles = [];
};

Seed.Source.TestSource.prototype = {
    fetchTile: function(tile, success) {
        this.fetchedTiles.push(tile);
        window.setTimeout(function() {success("fill in tile data here");}, 0);
    }
};