SRC=src/seed.js src/cache.js src/grid.js src/source.js src/util.js

seed.min.js: $(SRC)
	cat $(SRC) | slimit > seed.min.js

seed.js: $(SRC)
	cat $(SRC) > seed.js

doc/index.html: seed.js README.md
	@mkdir -p doc
	jsdoc --configure jsdoc-conf.json --recurse --verbose --destination doc ./src README.md
	@echo "done"

doc: doc/index.html jsdoc-conf.json

.PHONY: doc