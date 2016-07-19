'use strict';

var fs = require('fs');
var youtubedl = require('youtube-dl');
var async = require('async');

var outputFolder = 'output';

function getVideo(videoURL, format) {
  console.log('videoURL:', videoURL);

  function getFileName(infoFilename) {
    // remove id from filename
    var urlTokens = videoURL.split('?v=');
    var id = urlTokens[urlTokens.length - 1];
    return infoFilename.replace('-' + id, '');
  }
  
  switch(format) {
    case 'mp4': {
      var video = youtubedl(videoURL, ['--format=18'], { cwd: __dirname });

      // Will be called when the download starts.
      video.on('info', function(info) {
        console.log('Download started');
        console.log('filename: ' + info._filename);

        video
          .pipe(fs.createWriteStream(outputFolder + '/' + getFileName(info._filename)));
      });

      break;
    }
    default: {
      // mp3
      // does some magic using youtubedl: downloads webm, turns into mp3, deletes webm
      youtubedl.exec(videoURL,
        ['-x', '--audio-format', 'mp3'],
        { cwd: __dirname + '/' + outputFolder },
        function(err, output) {
          if (err) {
            return console.log(err);
          }
          console.log(output.join('\n'));
      });
    }
  }
}

function processEachVideo(videoTokens, format) {
  async.each(videoTokens,
    function(videoURL, callback) {

      if(videoURL === '') {
        return callback();
      }

      // request video
      getVideo(videoURL, format);
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

  // create folder if it does not exist
  if (!fs.existsSync(outputFolder)){
    fs.mkdirSync(outputFolder);
  }

  // process videos
  var videoTokens = data.toString().split('\n');
  var format = process.argv[3]; // mp3 and mp4 supported
  processEachVideo(videoTokens, format);
});
