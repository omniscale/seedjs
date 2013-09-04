/* Copyright (c) 2013 Omniscale
 * Published under the MIT licensecouchDB
 */

L.TileLayer.CouchDB = L.TileLayer.extend({
    options: {
    },

    initialize: function (url, options) {
        this._url = url;
        L.setOptions(this, options);
    },

    _loadTile: function (tile, tilePoint) {
        tile._layer  = this;

        tile.onload  = this._tileOnLoad;
        tile.onerror = this._tileOnError;

        this._adjustTilePoint(tilePoint);

        if (typeof this.options.sourceLayer != 'undefined') {
            tile._cacheUrl  = this.getTileUrl(tilePoint);
            tile._srcUrl = this.options.sourceLayer.getTileUrl(tilePoint);
            tile.src     = tile._cacheUrl;
        } else {
            tile.src  = this.getTileUrl(tilePoint);
        }
    },

    _tileOnError: function () {
        var layer = this._layer;

        if (this.src == this._cacheUrl) {
            // ideally we want to store the tile in the _tileOnLoad
            // handler but we only get an empty tile from canvas
            // in Google Chrome (tested w/ 29). To work around we
            // create a new _cacheImg only for storing the tile.
            // the browsers cache should prevent from loading the
            // actual image twice
            this._cacheImg = new Image();
            this._cacheImg.crossOrigin = "anonymous"
            var tile = this;
            this._cacheImg.onload = function() {
                var canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(this, 0, 0);
                var tileData = canvas.toDataURL("image/png");
                layer._cacheTile(tile._cacheUrl, tileData);
                delete tile._cacheImg;
            }
            this._cacheImg.src = this._srcUrl;
            this.src = this._srcUrl;
            return;
        }

        layer.fire('tileerror', {
            tile: this,
            url: this.src
        });


        var newUrl = layer.options.errorTileUrl;
        if (newUrl) {
            this.src = newUrl;
        }

        layer._tileLoaded();
    },

    _cacheTile: function(tileURL, tileData) {
        var req = new XMLHttpRequest();
        req.open("PUT", tileURL, true);
        req.onload = function (evt) {
            // stored
        };

        var blob = this._dataURIToBlob(tileData);
        blob.type = 'image/png';
        req.send(blob);
    },
    /** Convert base64 encoded data to Blob.
     * @param {string} base64 - binary data as base64 encoded string
     */
    _base64ToBlob: function(base64) {
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return new Blob([view]);
    },

    /**
     * Convert data URI to Blob.
     * @param {string} dataURI
     */
    _dataURIToBlob: function(dataURI) {
        return this._base64ToBlob(
            dataURI.replace(/^data:image\/(png|jpg);base64,/, "")
        );
    }
})

L.tileLayer.couchDB = function (url, options) {
    return new L.TileLayer.CouchDB(url, options);
};
