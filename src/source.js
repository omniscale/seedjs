/*
 * Copyright (c) 2013 Omniscale
 * Published under the MIT license.
 */

/** Sources
 * @namespace
*/
Seed.Source = {};

/**
 * WMTSSource fetches tiles from a WMTS source.
 *
 * The source only supports the WMTS OSM/Google Maps compatible tile
 * matrix set; origin noth/west.
 *
 * @constructor
 * @param url {string} - URL of a WMTS tile request.
 *    Use "{TileCol}", "{TileRow}", "{TileMatrix}" as placeholder for
 *    x, y and level of the tiles.
 */
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


/**
 * WMSSource fetches tiles from a WMS source.
 *
 * The source only supports EPSG:3857.
 *
 * @constructor
 * @param url {string} - URL of a full GetMap request, use "{BBOX}" as
 *   a placeholder for the BBOX value.
 */
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


/**
 * TestSource is a source for use in unit tests. The tile coordinates
 * of all fetched tiles are stored in
 *
 * The source only supports EPSG:3857.
 *
 * @constructor
 * @param url {string} - ignored
 * @property {array} fetchedTiles - lists all fetched tiles
 */
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