Seed.Seeder = function(task, source, dest) {
    this.task = task;
    this.source = source;
    this.dest = dest;
};

Seed.Seeder.prototype = {
    start: function() {
        for (var level = this.task.levels[0]; level < this.task.levels[1]; level++) {
            var affected = this.task.grid.affectedTiles(level, this.task.bbox);
            affected.tiles.foreach(function(tile) {
                console.log(tile);
            });
        };
    }
};