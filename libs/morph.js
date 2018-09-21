window.morph = (function(window) {

  var generateRndImage = function(sizeWidth, sizeHeight, iters) {
    var iters = iters || 50000;
    var res = [];
    for (var i = 0; i < sizeWidth; i++) {
      res[i] = [];
      for (var j = 0; j < sizeHeight; j++) {
        res[i][j] = 0;
      }
    }

    var pos = [ Math.floor(sizeWidth/2+Math.random()*sizeWidth/3-sizeWidth/6), Math.floor(sizeHeight/2+Math.random()*sizeHeight/3-sizeHeight/6) ];
    for (var i = 0; i < iters; i++) {
      res[pos[0]][pos[1]] = 1;
      pos[0] += Math.round( Math.random()*2-1 );
      pos[1] += Math.round( Math.random()*2-1 );
      if (pos[0] < 0) {
        pos[0] = sizeWidth - 1;
      }
      if (pos[0] >= sizeWidth) {
        pos[0] = 0;
      }
      if (pos[1] < 0) {
        pos[1] = sizeHeight - 1;
      }
      if (pos[1] >= sizeHeight) {
        pos[1] = 0;
      }
      if (Math.random() < 0.001) {
        pos = [ Math.floor(Math.random()*sizeWidth), Math.floor(Math.random()*sizeHeight) ];
      }
    }
    return res;
  };

  var generateStructureElement = function(size) {
    var res = [];
    for (var i = 0; i < size; i++) {
      res[i] = [];

      for (var j = 0; j < size; j++) {
        res[i][j] = 1;
      }
    }
    return res;
  };

  var erode = function(img, structElem) {
    var res = [];
    for (var i = 0; i < img.length; i++) {
      res[i] = [];

      for (var j = 0; j < img[0].length; j++) {
        var areEqual = 1, size = structElem.length;
        for (var sI = -Math.floor(size/2); sI < Math.ceil(size/2); sI++) {
          for (var sJ = -Math.floor(size/2); sJ < Math.ceil(size/2); sJ++) {
            if (i+sI < 0 || i+sI >= img.length || j+sJ < 0 || j+sJ >= img[0].length) var pixel = 1;
            else var pixel = img[i+sI][j+sJ];
            if (pixel != structElem[Math.floor(size/2)+sI][Math.floor(size/2)+sJ]) {
              areEqual = 0;
            }
          }
        }
        res[i][j] = areEqual;
      }
    }
    return res;
  };

  var complement = function(img) {
    var res = [];
    for (var i = 0; i < img.length; i++) {
      res[i] = [];
      for (var j = 0; j < img[0].length; j++) {
        res[i][j] = Math.abs( img[i][j] - 1 );
      }
    }
    return res;
  };

  var union = function(img1, img2) {
    var res = [];
    for (var i = 0; i < img1.length; i++) {
      res[i] = [];
      for (var j = 0; j < img1[0].length; j++) {
        res[i][j] = img1[i][j] || img2[i][j];
      }
    }
    return res;
  };

  var intersection = function(img1, img2) {
    return complement( union( complement(img1), complement(img2) ) );
  };

  var subtract = function(img1, img2) {
    return intersection( img1, complement(img2) );
  };

  var dilate = function(img, structElem) {
    return complement( erode( complement(img), structElem ) );
  };

  var open = function(img, structElem) {
    return dilate( erode(img, structElem), structElem );
  };

  var close = function(img, structElem) {
    return erode( dilate(img, structElem), structElem );
  };

  var boundary = function(img, structElem) {
    return subtract(img, erode(img, structElem));
  };

  var genRandStructElem = function(size, p) {
    var res = [];
    for (var i = 0; i < size; i++) {
      res[i] = [];

      for (var j = 0; j < size; j++) {
        if (Math.random() > p) {
          res[i][j] = 1;
        }
        else {
          res[i][j] = 0;
        }
      }
    }
    return res;
  };

  var genGolStructs = function() {
    var structs = [], structSize = 2, numStructs = 20, p = 0.5;
    for (var i = 0; i < numStructs; i++) {
      structs[i] = genRandStructElem(structSize, p);
    }
    return structs;
  };

  var blankImage = function(width, height) {
    var res = [];
    for (var i = 0; i < width; i++) {
      res[i] = [];
      for (var j = 0; j < height; j++) {
        res[i][j] = 0;
      }
    }

    return res;
  };

  var blackImage = function(width, height) {
    var res = [];
    for (var i = 0; i < width; i++) {
      res[i] = [];
      for (var j = 0; j < height; j++) {
        res[i][j] = 0;
      }
    }

    return res;
  };

  var gol = function(img, structs) {
    var res = blankImage(img.length, img[0].length);
    for (var i = 0; i < structs.length; i++) {
      res = union(res, erode(img, structs[i]));
    }
    return res;
  };

  var drawImage = function(img, canvas, foreground, background) {
    if (foreground === undefined) foreground = [ 0, 0, 0 ];
    if (background === undefined) background = [ 255, 255, 255 ];

    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < canvas.width; i++) {
      for (var j = 0; j < canvas.height; j++) {
        if (img[i][j] != 0) {
          ctx.fillStyle = 'rgba('+foreground[0]+','+foreground[1]+','+foreground[2]+','+img[i][j]+')';
          ctx.fillRect(i, j, 1, 1);
        }
      }
    }
  };

  return {
    generateRandomImage: generateRndImage,
    generateStructureElement: generateStructureElement,
    erode: erode,
    dilate: dilate,
    complement: complement,
    union: union,
    intersection: intersection,
    open: open,
    close: close,
    subtract: subtract,
    boundary: boundary,
    generateRandomGOLStructs: genGolStructs,
    gol: gol,
    drawImage: drawImage,
    blackImage: blackImage
  };
})(window);