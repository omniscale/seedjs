CacheControl = OpenLayers.Class(OpenLayers.Control, {
    fetchEvent: "tileloadstart",
    fetch: function(evt) {
        console.log(evt);
        if (this.active && window.localStorage &&
                evt.tile instanceof OpenLayers.Tile.Image) {
            var tile = evt.tile,
                url = tile.url;
            // deal with modified tile urls when both CacheWrite and CacheRead
            // are active
            if (!tile.layer.crossOriginKeyword && OpenLayers.ProxyHost &&
                    url.indexOf(OpenLayers.ProxyHost) === 0) {
                url = OpenLayers.Control.CacheWrite.urlMap[url];
            }
            var dataURI = window.localStorage.getItem("olCache_" + url);
            if (dataURI) {
                tile.url = dataURI;
                if (evt.type === "tileerror") {
                    tile.setImgSrc(dataURI);
                }
            }
        }
    },
    debug: function(evt) {
        window.tile = evt;
        console.log(evt);
        // "http://localhost:8888/proxy/http://localhost:5984/seedjs/1-0-0/tile"
    },
    setLayer: function(layer) {
        layer.events.register("tileerror", this, this.debug);
    }
});

CacheTile = OpenLayers.Class(OpenLayers.Tile.Image, {
    loadAttempts: 0,
    crossOriginKeyword: 'Anonymous',


    onImageLoad: function() {
        var img = this.imgDiv;
        console.log('loaded', this.url, img.src)
        if (img.src != this.url) {
            console.log("huhu")
            // window.lastImage = img;
            // window.lastTile = this;

            // var canvas = document.createElement("canvas");
            // canvas.width = img.width;
            // canvas.height = img.height;
            // img.style.visibility = "inherit";
            // img.style.opacity = 1;
            // console.log(img.complete, img.naturalWidth)

            // console.log(img.style.visibility)
            // console.log(img.style.opacity)
            // var ctx = canvas.getContext("2d");
            // // img.x = 0;
            // // img.y = 0;
            // // img.style.left = 0;
            // // img.style.top = 0;

            // ctx.drawImage(img, 0, 0);
            // ctx.fillStyle = "rgb(200,0,0)";
            // ctx.fillRect (10, 10, 55, 50);

            // console.log(img)
            // document.body.appendChild(canvas);

            // var tileData = canvas.toDataURL(self.imageFormat || "image/png");
            // console.log(tileData.length, tileData)

        }
        OpenLayers.Tile.Image.prototype.onImageLoad.apply(this);
    },
    onImageError: function() {
        var img = this.imgDiv;
        if (img.src != null) {
            if (this.loadAttempts < 10) {
                this.loadAttempts += 1;
                var newImgSrc = this.layer.sourceLayer.getURL(this.bounds);
                console.log('not found:', this.loadAttempts, img.src, newImgSrc, this.crossOriginKeyword);
                var self = this;
                img.onload = function() {
                    OpenLayers.Element.removeClass(this, "olImageLoadError");
                    var canvas = document.createElement("canvas");
                    canvas.width = this.width;
                    canvas.height = this.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0);

                    var tileData = canvas.toDataURL(self.imageFormat || "image/png");
                    console.log(tileData.length)
                    self.cacheTile(self.url, tileData);
                }
                img.crossOrigin = "Anonymous"
                img.src = newImgSrc;
            } else {
                console.log("wut", this.loadAttempts, img.src, this.url);
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
            console.log("cached!", evt);
        };

        var blob = new Blob(
            [dataURIToBlob(tileData)],
            {type: 'image/png'}
        );
        req.send(blob);
    }
});


CacheLayer = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    tileClass: CacheTile,

    initialize: function(name, url, options) {
        this.sourceLayer = options.sourceLayer;
        this.sourceLayer.displayInLayerSwitcher = false;
        OpenLayers.Layer.XYZ.prototype.initialize.apply(this, [
            name || this.name, url || this.url, {}, options
        ]);
    },
    afterAdd: function() {
        this.map.addLayer(this.sourceLayer);
        OpenLayers.Layer.XYZ.prototype.afterAdd.apply(this);
        // this.events.on({tileloaded: this.onLoadEnded});
    },
    // onLoadEnded: function(evt) {
    //     // console.log(this.active, evt.aborted, evt.tile, evt.tile.url);

    //     if (!evt.aborted && evt.tile instanceof CacheTile &&
    //             !evt.tile.loadAttempts) {
    //         this.isLoading = false;

    //         var canvasContext = evt.tile.getCanvasContext();
    //         console.log(evt.tile);

    //         this.isLoading = true;
    //         if (canvasContext) {
    //             console.log('caching:', evt.tile.imgDiv.src, this.imageFormat);
    //             var tileData = canvasContext.canvas.toDataURL(this.imageFormat || "image/png");
    //             console.log(tileData);
    //             this.cacheTile(evt.tile.url, tileData);
    //         } else {
    //             console.log('missing canvascontext', evt.tile.imgDiv.src)
    //         }

    //     } else {

    //     }
    // },
    cacheTile: function(tileURL, tileData) {
        var req = new XMLHttpRequest();
        req.open("PUT", tileURL, true);
        req.onload = function (evt) {
            console.log("cached!", evt);
        };

        var blob = new Blob(
            [dataURIToBlob(tileData)],
            {type: 'image/png'}
        );
        req.send(blob);
    }
});


/** Convert base64 encoded data to Blob.
 * @param {string} base64 - binary data as base64 encoded string
 */
base64ToBlob = function(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return new Blob([view]);
};

/**
 * Convert data URI to Blob.
 * @param {string} dataURI
 */
dataURIToBlob = function(dataURI) {
    return base64ToBlob(
        dataURI.replace(/^data:image\/(png|jpg);base64,/, "")
    );
};