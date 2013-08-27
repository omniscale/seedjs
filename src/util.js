/** Util
 * @namespace
*/
Seed.Util = {};

/** Convert base64 encoded data to Blob.
 * @param {string} base64 - binary data as base64 encoded string
 */
Seed.Util.base64ToBlob = function(base64) {
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return new Blob([view]);
};

/**
 * Convert data URI to Blob.
 * @param {string} dataURI
 */
Seed.Util.dataURIToBlob = function(dataURI) {
    return Seed.Util.base64ToBlob(
        dataURI.replace(/^data:image\/(png|jpg);base64,/, "")
    );
};


/**
 * Convert Image to data URI.
 * @param {Image} img
 */
Seed.Util.imgToDataURI = function(img) {
    // use canvas to get the image as dataURI
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // TODO handle image/jpeg
    return canvas.toDataURI("image/png");
};

/**
 * Fetch a tile from URL and call {success} callback.
 */
Seed.Util.fetchTileURL = function (url, tile, success) {
    var img = new Image();
    if (Seed.CORSProxyURL != null && url.match(/https?:\/\//)) {
        img.crossOrigin = "Anonymous";
        img.src = Seed.CORSProxyURL + url;
    } else {
        img.src = url;
    }
    img.onload = function(){
        success({'url': url, 'coord': tile, 'data': Seed.Util.imgToDataURI(img)});
    }
}