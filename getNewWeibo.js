var self = this;
var REQUEST_URL
var settings
var timerId

self.onmessage = function(e) {
	settings = JSON.parse(e.data)

	REQUEST_URL = 'https://api.weibo.com/2/statuses/user_timeline.json?access_token=' + settings.token;

	if (settings.uid) {
		REQUEST_URL += '&uid=' + settings.uid
	} else if (settings.screenName) {
		REQUEST_URL += '&screen_name=' + settings.screenName
	} else {
		self.postMessage(JSON.stringify({err: 'missing uid or screen_name', type: "config"}))

		return false;
	}

	if (settings.doRestart)
		clearInterval(timerId)

    checkNewWeibo(settings.interval)
}
 
function checkNewWeibo(interval) {
	var interval = parseInt(interval, 10) || 60 * 60 * 1000;

	/*
	var startTime = Date.now();

	function _checkNewWeibo(timestamp) {
		var progress = timestamp - startTime;
		if (progress >= interval) {
			getNewWeibo();
			return;
		}

		reqAnimationFrame(_checkNewWeibo);
	}

	reqAnimationFrame(_checkNewWeibo);
	*/

	timerId = setInterval(function() {
		getNewWeibo();
	}, interval);

	getNewWeibo();
}

function getNewWeibo() {
	var ret = [];

	self.postMessage(JSON.stringify({heartBeat: true, customMsg: 'get new weibo'}))

	// get weibo
	request(REQUEST_URL,
		function(res, xhr) {
			self.postMessage(JSON.stringify(res));
		},
		function(err, type, xhr) {
			self.postMessage(JSON.stringify({err: err, type: type}));
		}
	);
}

function request(url, ajaxSuccess, ajaxError) {
	var xhr = new XMLHttpRequest();

	var mimeToDataType = function(mime) {
      return mime && ( mime == 'text/html' ? 'html' :
        mime == 'application/json' ? 'json' :
        /^(?:text|application)\/javascript/i.test(mime) ? 'script' :
        /^(?:text|application)\/xml/i.test(mime) && 'xml' ) || 'text'
    };

	xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = null;
        var result, dataType, error = false;

        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = /^\s*$/.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr)
          else ajaxSuccess(result, xhr)
        } else {
          ajaxError(null, xhr.status ? 'error' : 'abort', xhr)
        }
      }
    }

    xhr.open('GET', url);
    xhr.send();
}