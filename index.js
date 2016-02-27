'use strict';

var fs = require('fs');
var youtubedl = require('youtube-dl');
var async = require('async');

var outputFolder = 'output/';

function getVideo(videoURL) {
  console.log('videoURL:', videoURL);
  var video = youtubedl(videoURL, ['--format=18'], { cwd: __dirname });


  function getFileName(infoFilename) {
    // remove id from filename
    var urlTokens = videoURL.split('?v=');
    var id = urlTokens[urlTokens.length - 1];
    return infoFilename.replace('-' + id, '');
  }

  // Will be called when the download starts.
  video.on('info', function(info) {
    console.log('Download started');
    console.log('filename: ' + info._filename);

    video
      .pipe(fs.createWriteStream(outputFolder + getFileName(info._filename)));
  });
}

function processEachVideo(videoTokens) {
  async.each(videoTokens,
    function(videoURL, callback) {

      if(videoURL === '') {
        return callback();
      }

      // request video
      getVideo(videoURL);
      callback();
    }, function(err) {
      if(err) {
        // only logs the errors
        return console.log(err);
      }
  });
}

fs.readFile( __dirname + '/' + process.argv[2], function (err, data) {
  if (err) {
    throw err;
  }

  var videoTokens = data.toString().split('\n');
  processEachVideo(videoTokens);
});
