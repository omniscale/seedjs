Seed.Util = {};

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

Seed.Util.dataURLToBlob = function(dataUrl) {
    return Seed.Util.base64ToBlob(
        dataUrl.replace(/^data:image\/(png|jpg);base64,/, "")
    );
};

Seed.Util.imgToDataURL = function(img) {
    // use canvas to get the image as dataURL
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // TODO handle image/jpeg
    return canvas.toDataURL("image/png");
};


Seed.Util.fetchTileURL = function (url, tile, success) {
    var img = new Image();
    if (Seed.CORSProxyURL != null && url.match(/https?:\/\//)) {
        img.crossOrigin = "Anonymous";
        img.src = Seed.CORSProxyURL + url;
    } else {
        img.src = url;
    }
    img.onload = function(){
        success({'url': url, 'coord': tile, 'data': Seed.Util.imgToDataURL(img)});
    }
}