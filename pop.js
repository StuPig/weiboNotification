var LS = chrome.extension.getBackgroundPage().localStorage
var data = LS.getItem('lastTweets');

chrome.browserAction.setBadgeText({text: ""})

document.addEventListener('DOMContentLoaded', function(){
	render(JSON.parse(data));
});

function render(data) {
	var tmplSrc = window.tmpl('#tweet');
	var fragment = '';

	data.forEach(function(tweet) {
		if (!tweet.retweeted_status) tweet.retweeted_status = '';
		if (!tweet.original_pic) tweet.original_pic = '';
		if (tweet.retweeted_status !== '' && !tweet.retweeted_status.original_pic)
			tweet.retweeted_status.original_pic = ''; 

		fragment += tmplSrc(tweet)
	})

	document.body.innerHTML = fragment;
}