describe("Grid", function() {
  var grid;

  beforeEach(function() {
    grid = new Seed.Grid();
  });

  it("should have a default bbox", function() {
    expect(grid.bbox).toEqual(Seed.DefaultBBox);
  });

  it("should have resolutions", function() {
    expect(grid.resolutions.length).toEqual(20);
    expect(grid.resolutions[0]).toEqual(156543.03392804097);
    expect(grid.resolutions[19]).toEqual(0.29858214173896974);
  });

  it("returns bbox of tile", function() {
    expect(grid.tileBBox(0, 0, 0)).toEqual(Seed.DefaultBBox);
    expect(grid.tileBBox(0, 0, 1)).toEqual(
        new Seed.BBox(-20037508.342789244, 0, 0, 20037508.342789244));
    expect(grid.tileBBox(0, 1, 1)).toEqual(
        new Seed.BBox(-20037508.342789244, -20037508.342789244, 0, 0));
    expect(grid.tileBBox(1, 1, 1)).toEqual(
        new Seed.BBox(0, -20037508.342789244, 20037508.342789244, 0));
  });

  it("returns tile for point", function() {
    expect(grid.tile(0, 0, 0)).toEqual([0, 0, 0]);
    expect(grid.tile(0, 0, 1)).toEqual([1, 1, 1]);
    expect(grid.tile(-1000, 0, 1)).toEqual([0, 1, 1]);
    expect(grid.tile(-1000, -1000, 1)).toEqual([0, 1, 1]);
    expect(grid.tile(-1000, 1000, 1)).toEqual([0, 0, 1]);
    expect(grid.tile(914776.39502896, 7011024.3611765, 18)).toEqual([137055, 85210, 18]);
  });

  it("returns tile iter for affected tiles", function() {
    var affected = grid.affectedTiles(1);
    expect(affected.numTiles).toEqual([2, 2]);
    expect(affected.next()).toEqual([0, 0, 1]);
    expect(affected.next()).toEqual([1, 0, 1]);
    expect(affected.next()).toEqual([0, 1, 1]);
    expect(affected.next()).toEqual([1, 1, 1]);
    expect(affected.next()).toEqual(null);

    affected = grid.affectedTiles(2);
    expect(affected.numTiles).toEqual([4, 4]);
    expect(affected.next()).toEqual([0, 0, 2]);
    expect(affected.next()).toEqual([1, 0, 2]);
    expect(affected.next()).toEqual([2, 0, 2]);
    expect(affected.next()).toEqual([3, 0, 2]);
    expect(affected.next()).toEqual([0, 1, 2]);
  });

  it("affected tiles iter contains expected number of tiles", function() {
    affected = grid.affectedTiles(4);
    var tileCount = 0;
    affected.foreach(function(tile) {
        tileCount += 1;
        expect(tile[2]).toEqual(4);
    })
    expect(tileCount).toEqual(16 * 16);

  });

  it("returns tile iter for bbox", function() {
    var bbox = new Seed.BBox(910447.65763357, 7006500.2326137, 917948.04103271, 7012529.2032187);
    var tileCount, affected;

    affected = grid.affectedTiles(0, bbox);
    expect(affected.numTiles).toEqual([1, 1]);
    tileCount = 0;
    affected.foreach(function(tile) {
        tileCount += 1;
        expect(tile).toEqual([0, 0, 0]);
    })
    expect(tileCount).toEqual(1);



    affected = grid.affectedTiles(4, bbox);
    expect(affected.numTiles).toEqual([1, 1]);
    tileCount = 0;
    affected.foreach(function(tile) {
        tileCount += 1;
        expect(tile).toEqual([8, 5, 4]);
    })
    expect(tileCount).toEqual(1);


    affected = grid.affectedTiles(16, bbox);
    expect(affected.numTiles).toEqual([14, 11]);

    tileCount = 0;
    affected.foreach(function(tile) {
        tileCount += 1;
        expect(tile[0]).toBeGreaterThan(34255);
        expect(tile[1]).toBeGreaterThan(21299);
        expect(tile[2]).toEqual(16);
    })
    expect(tileCount).toEqual(14*11);
  });


});