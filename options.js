document.addEventListener('DOMContentLoaded', function() {
	var elHasNotify = document.querySelector('#hasNotify');
	var elUid = document.querySelector('#uid');
	var elInterval = document.querySelector('#frequency');
	var elToken = document.querySelector('#token');
	var elScreenName = document.querySelector('#screenName');
	var LS = chrome.extension.getBackgroundPage().localStorage;

	if (elHasNotify.value) {
		LS.setItem('hasNotify', elHasNotify.value)
	}
	if (elUid.value) {
		LS.setItem('uid', elUid.value)
	}
	if (elInterval.value) {
		LS.setItem('interval', elInterval.value)
	}
	if (elToken.value) {
		LS.setItem('token', elToken.value)
	}
	if (elScreenName.value) {
		LS.setItem('screen_name', elScreenName.value)
	}

	restart();

	elHasNotify.onchange = function() {
		LS.setItem('hasNotify', this.checked)
		restart()
	}
	elUid.onchange = function() {
		LS.setItem('uid', this.value)
		restart()
	}
	elScreenName.onchange = function() {
		LS.setItem('screen_name', this.value)
		restart()
	}
	elInterval.onchange = function() {
		LS.setItem('interval', this.value)
		restart()
	}
	elToken.onchange = function() {
		LS.setItem('token', this.value)
		restart()
	}

	function restart() {
		LS.removeItem('lastTweetTime')
		LS.removeItem('lastTweets')

		chrome.extension.getBackgroundPage().postMsg(LS.uid, LS.interval, LS.token, LS.screen_name, true);
	}
})