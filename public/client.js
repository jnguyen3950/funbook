var player = document.getElementById('player');
var tag = document.getElementById('tag');
var homeButton = document.getElementById('homeButton');
var playlistButton = document.getElementById('playlistButton');
var historyButton = document.getElementById('historyButton');
var trendingButton = document.getElementById('trendingButton');
var loginError = document.getElementById('loginError');
var loginButton = document.getElementById('loginButton');
var loginSubmitButton = document.getElementById('loginSubmitButton')
var signupError = document.getElementById('signupError');
var signupButton = document.getElementById('signupButton');
var signupSubmitButton = document.getElementById('signupSubmitButton');
var logoutButton = document.getElementById('logoutButton');
var sidebar = document.getElementById('sidebar');
var sidebarPlaylist = document.getElementById('sidebarPlaylist');
var sidebarHistory = document.getElementById('sidebarHistory');
var main = document.getElementById('main');
var searchButton = document.getElementById('searchButton');
var searchBox = document.getElementById('searchBox');
var recommend = document.getElementById('recommend');
var recommendResult = document.getElementById('recommendResult');
var trending = document.getElementById('trending');
var trendingResult = document.getElementById('trendingResult');
var search = document.getElementById('search');
var searchResult = document.getElementById('searchResult');
var playVideo = document.getElementById('playVideo');
var videoTitle = document.getElementById('videoTitle');
var videoDescription = document.getElementById('videoDescription');
var commentNode = document.getElementById('comment');

var loginStatus;
var currentVideoId;
var playlistArray = [];
var currentPlaylistIndex = 0;

searchButton.addEventListener('click', function(event) {
  searchData();
})

searchBox.addEventListener('keypress', function(event) {
  if (event.keyCode == 13) {
    searchData();
    event.preventDefault();
  }
})

homeButton.addEventListener('click', function(event) {
  if(loginStatus == 200) {
    recommendData();
    showRecommendVideo();
  }
  showHome();
  showRecommendVideo();
})

trendingButton.addEventListener('click', function(event) {
  trendingData();
  showTrending();
})

historyButton.addEventListener('click', function() {
  showHistory();
})

playlistButton.addEventListener('click', function() {
  showPlaylist();
})

signupSubmitButton.addEventListener('click', function(event) {
  signup();
})

loginSubmitButton.addEventListener('click', function() {
  var inputUsername = document.getElementById('inputUsername').value;
  var inputPassword = document.getElementById('inputPassword').value;

  login(inputUsername, inputPassword);
})

logoutButton.addEventListener('click', function() {
  var xhr = new XMLHttpRequest;
  xhr.open('GET', '/logout');
  xhr.send();
  xhr.addEventListener('load', function() {
    showLoggedOut();
    clearResult(recommendResult);
    hideRecommendVideo();
    clearResult(sidebarHistory, 3);
    clearResult(sidebarPlaylist, 3);
  })
});

document.getElementById('good').addEventListener('click', function(event) {
  writeHistory(currentVideoId, 1);
});

document.getElementById('bleh').addEventListener('click', function(event) {
  writeHistory(currentVideoId, 2);
});

window.addEventListener('load', function() {
  var xhr = new XMLHttpRequest;
  xhr.open('GET', '/loggedin', true);
  xhr.send();
  xhr.addEventListener('load', function() {
    var loginStatus = xhr.status;
    if(loginStatus == 200) {
      showLoggedIn();
      historyData();
      recommendData();
      showRecommendVideo();
      getPlaylist();
    }
    trendingData();
    showHome();
  });
});

function signup() {
  var signupUsername = document.getElementById('signupUsername').value;
  var signupPassword = document.getElementById('signupPassword').value;

  var data = {username: signupUsername,
              password: signupPassword}

  var xhr = new XMLHttpRequest;
  xhr.open('POST', '/signup');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
  xhr.addEventListener('load', function() {
    var response = xhr.responseText;
    if (response == 'OK') {
      login(signupUsername, signupPassword);
    }
    else {
      signupError.classList.remove("hidden");
      loginError.classList.add("hidden");
    }
  })
}

function login(inputUsername, inputPassword) {
  var loginInfo = {
    username: inputUsername,
    password: inputPassword
  }

  var data = JSON.stringify(loginInfo);
  var xhr = new XMLHttpRequest;
  xhr.open('POST', '/login');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(data);
  xhr.addEventListener('load', function() {
    var loginStatus = xhr.status;
    if(loginStatus == 200) {
      showLoggedIn();
      historyData();
      recommendData();
      showRecommendVideo();
    }
    else {
      loginError.classList.remove("hidden");
      signupError.classList.add("hidden");
    }
  })
}

function recommendData() {
  clearResult(recommendResult);
  var response;
  var promise = new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', '/history');
    xhr.send();
    xhr.addEventListener('load', function() {
      response = JSON.parse(xhr.responseText);
      resolve(response);
    });
  });

  promise.then(function(value) {
    var maxResult = 8;
    value = _.shuffle(value);
    if (value.length < maxResult) maxResult = value.length;
    for (var i = 0; i < maxResult; i++) {
      var morePromise = new Promise(function(resolve, reject) {
        var data = {watchedId: value[i]};
        var searchXhr = new XMLHttpRequest;
        searchXhr.open('POST', '/searchRecommend');
        searchXhr.setRequestHeader('Content-type', 'application/json');
        searchXhr.send(JSON.stringify(data));
        searchXhr.addEventListener('load', function() {
          var searchResponse = JSON.parse(searchXhr.responseText);
          resolve(searchResponse.items);
        })
      })
      morePromise.then(function(items) {
        var id = items[0].id.videoId;
        var link = "https://www.youtube.com/watch?v=" + id;
        var img = items[0].snippet.thumbnails.high.url;
        var title = items[0].snippet.title;
        var description = items[0].snippet.description;
        addThumbnail(recommendResult, link, id, img, title, description);
      });
    }
  })
};

function trendingData() {
  clearResult(trendingResult);
  var xhr = new XMLHttpRequest;
  xhr.open('GET', '/trending');
  xhr.send();
  xhr.addEventListener('load', function() {
    var response = JSON.parse(xhr.responseText);
    var items = response.items;
    for (var i = 0; i < items.length; i++) {
      var id = items[i].id;
      var link = "https://www.youtube.com/watch?v=" + id;
      var img = items[i].snippet.thumbnails.high.url;
      var title = items[i].snippet.title;
      var description = items[i].snippet.description;
      addThumbnail(trendingResult, link, id, img, title, description);
    }
  })
};

function searchData() {
  clearResult(searchResult);
  var data = {term: searchBox.value};
  var xhr = new XMLHttpRequest;
  xhr.open('POST', '/search');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
  xhr.addEventListener('load', function() {
    var response = JSON.parse(xhr.responseText);
    for (var i = 0; i < response.length; i++) {
      var link = response[i].link;
      var id = response[i].id;
      var img = response[i].thumbnails.high.url;
      var title = response[i].title;
      var description = response[i].description;
      addThumbnail(searchResult, link, id, img, title, description);
    }
    attachPlaylistButtonListener();
  })
  showSearchResult();
}

function attachThumbnailListener(thumbImage) {
  thumbImage.addEventListener('click', function(event) {
    noneTag();
    var promise = new Promise(function(resolve, reject) {
      currentVideoId = event.target.getAttribute('data-id');
      writeHistory(currentVideoId);

      var link = event.target.getAttribute('data-link');
      link = link.replace("watch?v=", "embed/");
      link = link + "?autoplay=1";
      player.setAttribute('src', link);
      showPlayVideo();
      clearResult(videoTitle);
      clearResult(videoDescription, 2);
      clearResult(commentNode, 2);

      var caption = (event.target.nextSibling);
      videoTitle.appendChild(document.createTextNode(caption.firstChild.textContent));
      videoDescription.appendChild(document.createTextNode(event.target.getAttribute('data-description')));

      var data = {dataId: currentVideoId};
      var xhr = new XMLHttpRequest;
      xhr.open('POST', '/comments');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(data));
      xhr.addEventListener('load', function() {
        var response = JSON.parse(xhr.response);
        var commentArray = response.items;
        if(commentArray.length > 0) {
          for (var i = 0; i < commentArray.length; i++) {
            addCommentMedia(commentArray[i], commentNode);
          }
        }
        else {
          var noComment = document.createElement('h1');
          var noCommentText = document.createTextNode('No comment.');
          noComment.appendChild(noCommentText);
          commentNode.appendChild(noComment);
        }
        resolve(response);
      })
    })
    promise.then(function() {
      historyData();
    })
  })
}

function addThumbnail(node, link, id, img, titleText, description) {
  var videoBlock = document.createElement('div');
  var videoThumbnail = document.createElement('div');
  var thumbImage = document.createElement('img');
  var caption = document.createElement('div');
  var title = document.createElement('h5');
  var titleTextNode = document.createTextNode(titleText);
  var addPlaylist = document.createElement('a');
  var addPlayListTextNode = document.createTextNode('Add to playlist');

  node.appendChild(videoBlock);
  videoBlock.appendChild(videoThumbnail);
  videoThumbnail.appendChild(thumbImage);
  videoThumbnail.appendChild(caption);
  caption.appendChild(title);
  caption.appendChild(addPlaylist);
  title.appendChild(titleTextNode);
  addPlaylist.appendChild(addPlayListTextNode);

  videoBlock.setAttribute('class', 'col-sm-6 col-md-3');
  videoThumbnail.setAttribute('class', 'thumbnail');
  thumbImage.setAttribute('data-link', link);
  thumbImage.setAttribute('data-id', id);
  thumbImage.setAttribute('data-description', description);
  thumbImage.setAttribute('src', img);
  thumbImage.setAttribute('alt', 'Result video picture.');
  thumbImage.setAttribute('class', 'videoImage');
  caption.setAttribute('class', 'caption');
  caption.setAttribute('style', 'height: 120px');
  addPlaylist.setAttribute('class', 'btn btn-default playlistButton');
  addPlaylist.setAttribute('role', 'button');
  addPlaylist.setAttribute('data-link', link);
  addPlaylist.setAttribute('data-id', id);
  addPlaylist.setAttribute('data-img', img);

  attachThumbnailListener(thumbImage);
  attachPlaylistButtonListener(addPlaylist);
}

function attachPlaylistButtonListener(playlistButton) {
  playlistButton.addEventListener('click', function(event) {
    var playlistId = event.target.getAttribute('data-id');
    playlistArray.push(playlistId);
    playlistArray = _.uniq(playlistArray);
    writePlaylist([playlistId]);
    playlistData(playlistArray);
  })
}

function getPlaylist() {
  var promise = new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', '/getPlaylist');
    xhr.send();
    xhr.addEventListener('load', function() {
      var response = JSON.parse(xhr.response);
      resolve(response);
    })
  })
  promise.then(function(value) {
    playlistData(value);
    playlistArray = value;
  })
}

function playlistData(itemArray) {
  while (currentPlaylistIndex < itemArray.length) {
    var promise = new Promise(function(resolve, reject) {
      var data = {dataId: itemArray[currentPlaylistIndex]};
      var xhr = new XMLHttpRequest;
      xhr.open('POST', '/searchVideoId');
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.send(JSON.stringify(data));
      xhr.addEventListener('load', function() {
        var response = JSON.parse(xhr.response);
        resolve(response[0]);
      })
    })

    promise.then(function(item) {
      var sidebarPlaylist = document.getElementById('sidebarPlaylist');
      var videoBlock = document.createElement('div');
      var videoThumbnail = document.createElement('div');
      var thumbImage = document.createElement('img');
      var caption = document.createElement('div');
      var title = document.createElement('h5');
      var titleTextNode = document.createTextNode(item.title);

      sidebarPlaylist.appendChild(videoBlock);
      videoBlock.appendChild(videoThumbnail);
      videoThumbnail.appendChild(thumbImage);
      videoThumbnail.appendChild(caption);
      caption.appendChild(title);
      title.appendChild(titleTextNode);

      videoThumbnail.setAttribute('class', 'thumbnail');
      thumbImage.setAttribute('data-link', item.link);
      thumbImage.setAttribute('data-id', item.id);
      thumbImage.setAttribute('data-description', item.description);
      thumbImage.setAttribute('src', item.thumbnails.high.url);
      thumbImage.setAttribute('alt', 'Result video picture.');
      thumbImage.setAttribute('class', 'videoImage');
      caption.setAttribute('class', 'caption');

      attachThumbnailListener(thumbImage);

      videoBlock.addEventListener('click', function() {
        playlistArray = _.reject(playlistArray, function(target) {return target == response[0].id});
        writePlaylist(playlistArray);

        videoBlock.removeChild(videoBlock.firstChild);
      })
    })
    currentPlaylistIndex++;
  }
}

function writePlaylist(videoId) {
  this.videoId = videoId;

  data = {
    videoId: this.videoId
  }

  var xhr = new XMLHttpRequest;
  xhr.open('POST', '/writePlaylist');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
}

function writeHistory(videoId, thumb) {
  this.videoId = videoId;
  this.thumb = thumb || 0;

  data = {
    videoId: this.videoId,
    thumb: this.thumb
  }

  var xhr = new XMLHttpRequest;
  xhr.open('POST', '/writeHistory');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.send(JSON.stringify(data));
  xhr.addEventListener('load', function() {
    var response = xhr.responseText;
    if (response == 1) {
      goodTag();
    }
    else if (response == 2) {
      blehTag();
    }
  })
}

function historyData() {
  clearResult(sidebarHistory, 3);
  var promise = new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest;
    xhr.open('GET', '/history');
    xhr.send();
    xhr.addEventListener('load', function() {
      response = JSON.parse(xhr.responseText);
      resolve(response);
    });
  })

  promise.then(function(response) {
    for (var i = 0; i < response.length; i++) {
      var morePromise = new Promise(function(resolve, reject) {
        var data = {dataId: response[i]};
        var searchXhr = new XMLHttpRequest;
        searchXhr.open('POST', '/searchVideoId');
        searchXhr.setRequestHeader('Content-type', 'application/json');
        searchXhr.send(JSON.stringify(data));
        searchXhr.addEventListener('load', function() {
          var searchResponse = JSON.parse(searchXhr.responseText);
          resolve(searchResponse[0]);
        })
      })
      morePromise.then(function(item) {
        var id = item.id;
        var link = "https://www.youtube.com/watch?v=" + id;
        var img = item.thumbnails.high.url;
        var titleText = item.title;
        var description = item.description;

        var sidebarHistory = document.getElementById('sidebarHistory');
        var videoBlock = document.createElement('div');
        var videoThumbnail = document.createElement('div');
        var thumbImage = document.createElement('img');
        var caption = document.createElement('div');
        var title = document.createElement('h5');
        var titleTextNode = document.createTextNode(titleText);

        sidebarHistory.appendChild(videoBlock);
        videoBlock.appendChild(videoThumbnail);
        videoThumbnail.appendChild(thumbImage);
        videoThumbnail.appendChild(caption);
        caption.appendChild(title);
        title.appendChild(titleTextNode);

        videoThumbnail.setAttribute('class', 'thumbnail');
        thumbImage.setAttribute('data-link', link);
        thumbImage.setAttribute('data-id', id);
        thumbImage.setAttribute('data-description', description);
        thumbImage.setAttribute('src', img);
        thumbImage.setAttribute('alt', 'Result video picture.');
        thumbImage.setAttribute('class', 'videoImage');
        caption.setAttribute('class', 'caption');

        attachThumbnailListener(thumbImage);
      });
    }
  });
}

function addCommentMedia(array, node) {
  var mediaBlock = document.createElement('div');
  var mediaLeft = document.createElement('div');
  var image = document.createElement('img');
  var mediaBody = document.createElement('div');
  var userName = document.createElement('h4');
  var userNameText = document.createTextNode(array.snippet.topLevelComment.snippet.authorDisplayName);
  var commentText = document.createTextNode(array.snippet.topLevelComment.snippet.textDisplay);

  node.appendChild(mediaBlock);
  mediaBlock.appendChild(mediaLeft);
  mediaLeft.appendChild(image);
  mediaBlock.appendChild(mediaBody);
  mediaBody.appendChild(userName);
  userName.appendChild(userNameText);
  mediaBody.appendChild(commentText);

  mediaBlock.setAttribute('class', 'media');
  mediaLeft.setAttribute('class', 'media-left');
  image.setAttribute('class', 'media-object');
  image.setAttribute('src', array.snippet.topLevelComment.snippet.authorProfileImageUrl);
  image.setAttribute('style', 'width: 64px; height: 64px;');
  mediaBody.setAttribute('class', 'media-body');
  userName.setAttribute('class', 'media-heading');
}
