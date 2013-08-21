Seed.WMTSSource = function(url) {
    this.url = url;
};

Seed.WMTSSource.prototype = {
    fetchTile: function(tile, success) {
        console.log(this.url, tile);
        setTimeout(function() {success("fill in tile data here");}, 200);
    }
};