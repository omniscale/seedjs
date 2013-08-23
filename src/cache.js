Seed.LocalStore = function(prefix) {
    this.prefix = prefix;
};

Seed.LocalStore.prototype = {
    storeTile: function(tile, success) {
        console.log(tile);
        window.localStorage.setItem(
            this.prefix + tile.url,
            tile.data);
        success(tile);
    }
};


Seed.CouchDB = function(url) {
    this.url = url;
};


Seed.CouchDB.prototype = {
    storeTile: function(tile, success) {
        var url = this.url;
        url = url.replace(/\{TileCol\}/, tile.coord[0]);
        url = url.replace(/\{TileRow\}/, tile.coord[1]);
        url = url.replace(/\{TileMatrix\}/, tile.coord[2]);
        var req = new XMLHttpRequest();
        req.open("PUT", url, true);
        req.onload = function (evt) {
            success(tile);
        };

        var blob = new Blob(
            [Seed.Util.dataURLToBlob(tile.data)],
            {type: 'image/png'}
        );
        req.send(blob);
    }
};