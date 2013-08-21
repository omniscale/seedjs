Seed.WMTSSource = function(url) {
    this.url = url;
};

Seed.WMTSSource.prototype = {
    fetchTile: function(tile, success) {
        setTimeout(function() {success("fill in tile data here");}, 0);
    }
};


Seed.TestSource = function(url) {
    this.url = url;
    this.fetchedTiles = [];
};

Seed.TestSource.prototype = {
    fetchTile: function(tile, success) {
        this.fetchedTiles.push(tile);
        window.setTimeout(function() {success("fill in tile data here");}, 0);
    }
};