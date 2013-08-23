Seed.WMTSSource = function(url) {
    this.url = url;
};

Seed.WMTSSource.prototype = {
    fetchTile: function(tile, success) {
        var url = this.url;
        url = url.replace(/\{TileCol\}/, tile[0]);
        url = url.replace(/\{TileRow\}/, tile[1]);
        url = url.replace(/\{TileMatrix\}/, tile[2]);

        var img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = function(){
            success({'url': url, 'coord': tile, 'data': Seed.Util.imgToDataURL(img)});
        }
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