/*
 * Copyright (c) 2013 Omniscale
 * Published under the MIT license.
 */

OpenLayers.CouchDBTile = OpenLayers.Class(OpenLayers.Tile.Image, {
    crossOriginKeyword: "anonymous",

    initialize: function() {
        OpenLayers.Tile.Image.prototype.initialize.apply(this, arguments);
    },

    onImageError: function() {
        var img = this.imgDiv;
        if (img.src != null) {
            if (this.imageReloadAttempts == 0 && typeof this.layer.sourceLayer != 'undefined') {
                this.imageReloadAttempts += 1;
                // try to load img from sourceLayer
                var newImgSrc = this.layer.sourceLayer.getURL(this.bounds);
                if (OpenLayers.ProxyHost) {
                    newImgSrc = OpenLayers.Request.makeSameOrigin(newImgSrc, OpenLayers.ProxyHost);
                }
                this.setImgSrc(newImgSrc);

                // ideally we want to store the tile in the onImageLoad
                // handler but we only get an empty tile from canvas
                // in Google Chrome (tested w/ 29). To work around we
                // create a new cacheImg only for storing the tile.
                // the browsers cache should prevent from loading the
                // actual image twice
                this.cacheImg = new Image();
                this.cacheImg.crossOrigin = "anonymous"
                var tile = this;
                this.cacheImg.onload = function() {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    var tileData = canvas.toDataURL("image/png");
                    tile.cacheTile(tile.url, tileData);
                }
                this.cacheImg.src = newImgSrc;
            } else {
                OpenLayers.Element.addClass(img, "olImageLoadError");
                this.events.triggerEvent("loaderror");
                this.onImageLoad();
            }
        }
    },
    cacheTile: function(tileURL, tileData) {
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
    },
    CLASS_NAME: "OpenLayers.CouchDBTile"
});


OpenLayers.Layer.CouchDBTile = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    tileClass: OpenLayers.CouchDBTile,

    initialize: function(name, url, options) {
        if (options) {
            this.sourceLayer = options.sourceLayer;
        }
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, [
            name || this.name, url || this.url, {}, options
        ]);
    },
    afterAdd: function() {
        if (typeof this.sourceLayer != 'undefined' && this.sourceLayer.map == null) {
            // sourceLayer needs to be added to map to be able
            // to generate URLs
            this.sourceLayer.displayInLayerSwitcher = false;
            this.map.addLayer(this.sourceLayer);
        }
        OpenLayers.Layer.XYZ.prototype.afterAdd.apply(this);
    },
    getURL: function(bounds) {
        var url = OpenLayers.Layer.XYZ.prototype.getURL.call(this, bounds)
        if (OpenLayers.ProxyHost) {
            url = OpenLayers.Request.makeSameOrigin(url, OpenLayers.ProxyHost);
        }
        return url
    },
    CLASS_NAME: "OpenLayers.Layer.CouchDBTile"
});
