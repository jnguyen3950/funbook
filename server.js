var express = require('express');
var app = express();
var jsonParser = require('body-parser').json();
var search = require('youtube-search');
var fetchCommentPage = require('youtube-comment-api')();

app.post('/search', jsonParser, function(req, res) {
  console.log(req.body.term);

  var opts = {
    maxResults: 12,
    key: 'AIzaSyDZ9sbX9zra9vN5WUjxMAQCf_5j01pHqVM',
    order: 'viewCount',
    type: 'video',
    videoType: 'movie',
  };

  search(req.body.term, opts, function(err, results) {
    if(err) return console.log(err);
    // console.dir(results);
    // console.dir(results.id);
    res.send(results);
  });

});

app.get('/view', function(req, res) {
  fetchCommentPage('KuvWdZ3SJuQ').then(function (commentPage) {
    console.log(commentPage);
    res.send(commentPage);
    // return commentPage.nextPageToken;
  // }).then(function (pageToken) {
  //   // request next page
  //   return fetchCommentPage('KuvWdZ3SJuQ', pageToken)
  // }).then(function (commentPage) {
  //   console.log(commentPage);
  });
});

app.use(express.static('./'));

app.listen(8080);
