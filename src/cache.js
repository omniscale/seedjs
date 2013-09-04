/*
 * Copyright (c) 2013 Omniscale
 * Published under the MIT license.
 */

/**
 * @namespace Seed.Cache
 */
Seed.Cache = {};

/**
 * Store tiles inside a HTML5 LocalStorage.
 *
 * Each tile is stored with a prefix and the full URL as the key.
 * Use `olCache_` as prefix to be able to use
 * {@link http://dev.openlayers.org/docs/files/OpenLayers/Control/CacheRead-js.html OpenLayers CacheRead}.
 *
 * NOTE: HTML5 LocalStorage only allows storage of a few MB, depending on the browser.
 *
 * @constructor
 * @param prefix {string} - Prefix for each tile key.
 */
Seed.Cache.LocalStore = function(prefix) {
    this.prefix = prefix;
};

Seed.Cache.LocalStore.prototype = {
    storeTile: function(tile, success) {
        console.log(tile);
        window.localStorage.setItem(
            this.prefix + tile.url,
            tile.data);
        success(tile);
    }
};

/**
 * Store tiles inside a couchdb.
 *
 * @constructor
 * @param url {string} - URL template for the tile attachment.
 *    Use "{TileCol}", "{TileRow}", "{TileMatrix}" as placeholder for
 *    x, y and level of the tiles.
 */
Seed.Cache.CouchDB = function(url) {
    this.url = url;
};


Seed.Cache.CouchDB.prototype = {
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
            [Seed.Util.dataURIToBlob(tile.data)],
            {type: 'image/png'}
        );
        req.send(blob);
    }
};