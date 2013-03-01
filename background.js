var worker = new Worker('getNewWeibo.js');
// 停止worker
// worker.terminate();
// worker.postMessage('xxxx');
// worker.onmessage = function(event) {}
// worker.onerror = function() {}
// var uid = 1670166522;
// var uid = 1835660561
var lastTime = 0;
var LS = localStorage;
var uid = LS.uid,
	interval = LS.interval,
	token = LS.token;

	function postMsg(uid, interval, token, screenName, doRestart) {
		worker.postMessage(JSON.stringify({
			uid: (uid || 1670166522),
			screenName: screenName,
			interval: (interval || 24000),
			token: (token || '2.006KPOACjUi7wCd567db4818FgyfjB'),
			doRestart: doRestart || false
		}));

	}

chrome.tabs.create({
	url: "options.html"
});

worker.onmessage = function(e) {
	var data = JSON.parse(e.data),
		doRestart = false;

	if (data.err) {
		// alert(data.type);
		console.log(data.type, data.err)
		alert(data.type);
	} else if (data.heartBeat) {
		console.log(data.customMsg)
	} else {
		notify(JSON.parse(data))
	}
}

function notify(data) {
	var obj = tweetFilter(data);
	var count = obj.tweets.length;
	var icon = obj.avatar,
		title = '有' + count + '条新微博',
		content = obj.content

	if (window.webkitNotifications.checkPermission() == 0 && obj.count && Boolean(LS.hasNotify)) { // 0 is PERMISSION_ALLOWED
		window.webkitNotifications.createNotification(
		icon, title, content).show();
		chrome.browserAction.setBadgeText({
			text: count.toString()
		})
	} else {
		window.webkitNotifications.requestPermission();
	}
}

function tweetFilter(data) {
	var ret = JSON.parse(LS.getItem('lastTweets')) || [],
		content = '',
		avatar = '',
		count = 0,
		lastTweetTime,
		isInit = !LS.getItem('lastTweetTime');

	data.statuses.forEach(function(tweet, index) {
		var ts = new Date(tweet.created_at).valueOf(),
			lastTweetTime = LS.getItem('lastTweetTime') || 0;

		if (isInit) {
			avatar = tweet.user.profile_image_url
			LS.setItem('avatar', avatar)

			if (index === 0){
				LS.setItem('lastTweetTime', ts)
			}

			content += '\t' + tweet.text + '\n\r\n\r';
			ret.push(tweet)

		} else if (ts > lastTweetTime) {
			++ count;
			content += '\t' + tweet.text + '\n\r\n\r';
			ret.unshift(tweet);

			if (ret.length > 20) {
				ret.pop();
			}
			LS.setItem('lastTweetTime', ts)
		}
	})

	LS.setItem('lastTweets', JSON.stringify(ret))

	isInit = false;

	return {
		tweets: ret,
		content: content,
		avatar: avatar,
		count: count
	}
}