Seed.Seeder = function(task, source, dest) {
    this.task = task;
    this.source = source;
    this.dest = dest;
    this.currentLevel = null;
    this.currentAffectedTiles = null;
    this.running = false;
};

Seed.Seeder.prototype = {
    start: function() {
        this.currentLevel = this.task.levels[0];
        this.currentAffectedTiles = this.task.grid.affectedTiles(
            this.currentLevel, this.task.bbox);
        this.running = true;
        this.next();
    },

    finished: function() {
        this.running = false;
        console.log('finished');
    },

    next: function() {
        if (!this.running) {
            return;
        }
        var tile = this.currentAffectedTiles.tiles.next();
        if (tile == null) {
            this.currentLevel += 1;
            if (this.currentLevel > this.task.levels[1]) {
                this.finished();
            }
            this.currentAffectedTiles = this.task.grid.affectedTiles(
                this.currentLevel, this.task.bbox);
            tile = this.currentAffectedTiles.tiles.next();
        }

        var nextStep = this.next.bind(this);
        var progressStep = this.progress.bind(this);
        this.source.fetchTile(tile, function(data) {
            progressStep(tile);
            nextStep();
        });
    },

    progress: function(tile) {
        // console.log(tile);
    }
};