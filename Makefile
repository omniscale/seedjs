SRC=src/seed.js src/cache.js src/grid.js src/source.js src/util.js

seed.min.js: $(SRC)
	cat $(SRC) | slimit > seed.min.js