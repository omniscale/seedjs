function require(jspath) {
    var scriptName = "seed.dev.js";
    var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
        s = document.getElementsByTagName('script'),
        src, m, l = "";
    for(var i=0, len=s.length; i<len; i++) {
        src = s[i].getAttribute('src');
        if(src) {
            m = src.match(r);
            if(m) {
                l = m[1];
                break;
            }
        }
    }
    document.write('<script type="text/javascript" src="'+ l + jspath+'"><\/script>');
}
require("src/seed.js");
require("src/util.js");
require("src/grid.js");
require("src/source.js");
require("src/cache.js");
