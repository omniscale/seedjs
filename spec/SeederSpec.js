describe("Seeder", function() {
  var seeder;

  beforeEach(function() {
    seeder = new Seed.Seeder();
  });

  it("should seed tiles", function() {
    var source = new Seed.TestSource();
    seeder = new Seed.Seeder({
        grid: new Seed.Grid(),
        bbox: new Seed.BBox(910447.65763357, 7006500.2326137, 917948.04103271, 7012529.2032187),
        levels: [0, 15]
    }, source);

    runs(function() {
        seeder.start()
    });

    waitsFor(function() {
        return seeder.running == false;
    }, "The seeder should finish", 1000);

    runs(function() {
      expect(source.fetchedTiles.length).toEqual(72);
      expect(source.fetchedTiles[0]).toEqual([0, 0, 0]);
      expect(source.fetchedTiles[71]).toEqual([34256, 21300, 16]);
    });
  });

});