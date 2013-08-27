SeedJS
======

SeedJS is a JavaScript library for seeding tiles from sources like WMTS or WMS and storing them into a storage like CouchDB or LocalStorage.

Current features and limitations:

* plain JS, no jQuery/OL/etc. dependencies
* async API for background seeding
* requires HTLM5 Canvas and CORS support
* only supports a OSM/Google Maps compatible tile grid
* EPSG:3857 only, no reprojection of WMS sources and no meta-tiling


Current status: SeedJS is a proof of concept/prototype.


By default, you can only seed from local sources and can only store tiles in local databases due to the security restrictions of most browsers, where local means same domain and same port. To work around this limitation you need either sources/databases that support [CORS (Access-Control-Allow-Origin Headers)][CORS] or you need to [use a CORS proxy][corsa].

[CORS]: http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
[corsa]: https://pypi.python.org/pypi/corsa


## Example ##

You need to create a source, a cache and a seeder.
When the script is served from the CouchDB and the tile source sends CORS headers (as osm.org does):

        var cache = new Seed.Cache.CouchDB('/seedjs/{TileMatrix}-{TileCol}-{TileRow}/tile');
        var source = new Seed.Source.WMTSSource('http://a.tile.openstreetmap.org/{TileMatrix}/{TileCol}/{TileRow}.png');
        var seeder = new Seed.Seeder({
            grid: new Seed.Grid(),
            bbox: new Seed.BBox(910447.65763357, 7006500.2326137, 917948.04103271, 7012529.2032187),
            levels: [0, 8]
        }, source, cache);

Start seeding with a custom callback that gets called after each seeded tile:

        seeder.start(function(progress) {
            console.log(progress.tiles + "/" + progress.totalTiles);
            if (progress.running == false) {
                console.log("finished!");
            }
        });


To let SeedJS use a CORS proxy for all external URLs:

        Seed.CORSProxyURL = 'http://localhost:8888/proxy/'
        var source = new Seed.Source.WMSSource('http://x.osm.omniscale.net/proxy/service?LAYERS=osm&' +
            'FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A900913&' +
            'BBOX={BBOX}&WIDTH=256&HEIGHT=256&tiled=true');
        var cache = new Seed.Cache.CouchDB('http://localhost:5984/seedjs/{TileMatrix}-{TileCol}-{TileRow}/tile');

Requests will then go to http://localhost:8888/proxy/http://x.osm.omniscale.net/proxy/service and http://localhost:8888/proxy/http://localhost:5984/seedjs/.