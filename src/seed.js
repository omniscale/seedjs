/*
 * Copyright (c) 2013 Omniscale
 * Published under the MIT license.
 */

/**
 * @namespace
 */
var Seed = {};

/**
 * @property {string|null} Seed.CORSProxyURL - Proxy URL where all external requests should be sent to.
 *    When CORSProxyURL is set to http://example.org/proxy, then requests to http://foo.example go to
 *    http://example.org/proxy/http://foo.example. Use relative URLs to prevent proxying of local requests.
 */
Seed.CORSProxyURL = null;



/**
 * @constructor
 *
 * @param {Task} task - Describes what to seed.
 * @param {Source} source - Describes from where to seed.
 * @param {Cache} cache - Describes where to store the seeded data.
 */
Seed.Seeder = function(task, source, cache) {
    this.task = task;
    this.source = source;
    this.cache = cache;
    this.currentLevel = null;
    this.currentAffectedTiles = null;
    this.running = false;
    this.should_stop = false;
    this.progressCb = null;
    this.seededTiles = 0;
    this.totalTiles = this.task.grid.estimateTiles(this.task.bbox, this.task.levels);
};

Seed.Seeder.prototype = {

    /**
     * Called for each seeded tile.
     * @callback Seed.Seeder~ProgressCallback
     * @param {Seed.Seeder~SeedProgress} progress - the progress
     * @returns {bool} - false to stop seeding progress
     */
    /**
     * Start the seeding process in background.
     *
     * @param progress {Seed.Seeder~ProgressCallback} - callback gets called after each seeded tile.
     */
    start: function(progress) {
        this.currentLevel = this.task.levels[0];
        this.currentAffectedTiles = this.task.grid.affectedTiles(
            this.currentLevel, this.task.bbox);
        this.running = true;
        this.progressCb = progress;
        this.next();
    },

    /**
     * Stop the seeding process.
     * The progress callback will be called once more with running:false
     * when the seed is still running.
     */
    stop: function() {
        this.should_stop = true;
    },

    next: function() {
        if (!this.running) {
            return;
        }

        if (this.should_stop) {
            this.running = false;
            this.progress();
            return;
        }

        var tile = this.currentAffectedTiles.next();
        if (tile == null) {
            this.currentLevel += 1;
            if (this.currentLevel > this.task.levels[1]) {
                this.running = false;
                this.progress();
                return;
            }
            this.currentAffectedTiles = this.task.grid.affectedTiles(
                this.currentLevel, this.task.bbox);
            tile = this.currentAffectedTiles.next();
        }

        var seeder = this;
        function continueSeed() {
            var continueSeeding = seeder.progress();
            if (continueSeeding != false) {
                seeder.next();
            } else {
                this.running = false;
                this.progress();
            }
        }
        this.source.fetchTile(tile, function(tile) {
            if (seeder.cache != undefined) {
                seeder.cache.storeTile(tile, continueSeed);
            } else {
                continueSeed();
            }
        });
    },

    progress: function() {
        if (this.running) {
            this.seededTiles += 1;
        }
        if (this.progressCb != null) {
            /**
             * @typedef {Object} Seed.Seeder~SeedProgress
             * @property {number} tiles - number of already seeded tiles
             * @property {number} totalTiles - number of all tiles
             * @property {boolean} running - false if seeding stopped
             */
            return this.progressCb({'tiles': this.seededTiles, 'totalTiles': this.totalTiles, 'running': this.running});
        } else {
            return true; // continue seeding
        }
    }
};


