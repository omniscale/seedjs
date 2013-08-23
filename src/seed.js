var Seed = {};

Seed.Seeder = function(task, source, dest) {
    this.task = task;
    this.source = source;
    this.dest = dest;
    this.currentLevel = null;
    this.currentAffectedTiles = null;
    this.running = false;
    this.should_stop = false;
    this.progressCb = null;
    this.seededTiles = 0;
    this.totalTiles = this.task.grid.estimateTiles(this.task.bbox, this.task.levels);
};

Seed.Seeder.prototype = {
    start: function(progress) {
        this.currentLevel = this.task.levels[0];
        this.currentAffectedTiles = this.task.grid.affectedTiles(
            this.currentLevel, this.task.bbox);
        this.running = true;
        this.progressCb = progress;
        this.next();
    },

    finished: function() {
        this.running = false;
    },

    stop: function() {
        this.should_stop = true;
    },


    next: function() {
        if (!this.running) {
            return;
        }

        if (this.should_stop) {
            this.finished();
            this.progress();
        }

        var tile = this.currentAffectedTiles.tiles.next();
        if (tile == null) {
            this.currentLevel += 1;
            if (this.currentLevel > this.task.levels[1]) {
                this.finished();
                this.progress();
                return;
            }
            this.currentAffectedTiles = this.task.grid.affectedTiles(
                this.currentLevel, this.task.bbox);
            tile = this.currentAffectedTiles.tiles.next();
        }

        var seeder = this;
        function continueSeed() {
            seeder.progress();
            if (seeder.running) {
                seeder.next();
            }
        }
        this.source.fetchTile(tile, function(tile) {
            if (seeder.dest != undefined) {
                seeder.dest.storeTile(tile, continueSeed);
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
            this.progressCb({'tiles': this.seededTiles, 'totalTiles': this.totalTiles, 'running': this.running});
        }
    }
};