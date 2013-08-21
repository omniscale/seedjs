describe("Seeder", function() {
  var seeder;

  beforeEach(function() {
    seeder = new Seed.Seeder();
  });

  it("should start", function() {

    seeder = new Seed.Seeder({
        grid: new Seed.Grid(),
        bbox: new Seed.BBox(910447.65763357, 7006500.2326137, 917948.04103271, 7012529.2032187),
        levels: [0, 18]
    });
    seeder.start();
  });


});