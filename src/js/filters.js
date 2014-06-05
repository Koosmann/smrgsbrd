'use strict';

/* Filters */

// SCOPE TESTING

cats.filter('isCurrentUser', function($rootScope) {
	return function (id) {
		return angular.equals(id, $rootScope.currentUser.id) ? true : false;
	}
});

cats.filter('isUpdated', function($rootScope) {
	return function (id) {
		return ($rootScope.currentUser.updatedFeeds.indexOf(id) + 1) ? true : false;
	}
});

cats.filter('isFriend', function($rootScope) {
	return function (id) {
		return ($rootScope.currentUser.friends.indexOf(id) + 1) ? true : false;
	}
});

cats.filter('status', function () {
	return function (cat) {
		if (cat.online) {
			return cat.username + "*";
		} else {
			return cat.username;
		}
	};
});

cats.filter('loading', function () {
	return function (loading) {
		if (loading)
			return "color: #FF0057";
	}
});

// VISUAL

cats.filter('notEmptyString', function () {
	return function (string) {
		if (string !== undefined && string != null ) return string.length ? string : " ";
		else return " ";
	}
});

cats.filter('notTinyImage', function () {
	return function (image) {
		if (image.width > 25 && image.height > 25) return true;
		else return false;
	}
});

cats.filter('showLineBreaks', function ($sce) {
	return function (text) {
		return $sce.trustAsHtml(text.replace(/\n+/g, '<br /><br />'));
	}
});

cats.filter('previewText', function () {
	return function (text, length) {
		return text.substr(0, length) + ((text.length > length) ? ' ...' : '');
	}
});

// DATA CONVERSION

cats.filter('boolean', function () {
	return function (value) {
		if (value > 0 ) return true;
		else return false;
	}
});

cats.filter('lengthToBoolean', function () {
	return function (value) {
		if (value.length > 0 ) return true;
		else return false;
	}
});

cats.filter('toBoolean', function () {
	return function (value) {
	 	if (value && value.length !== 0) {
	    	var v = "" + value;
	    	v = v.toLowerCase();
	    	value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
	  	} else {
	    	value = false;
	  	}
	  	return value;
	}
});

cats.filter('encodeURIComponent', function () {
	return function (value) {
	  	return encodeURIComponent(value);
	}
});

cats.filter('decodeURIComponent', function () {
	return function (value) {
	  	return decodeURIComponent(value);
	}
});

cats.filter('fillSpaces', function () {
	return function (value) {
		return value.replace(/ /g, "-");
	}
});

cats.filter('roundUp', function () {
	return function (value) {
		if (value !== undefined) {
			if (value - Math.floor(value) < Math.ceil(value) - value) 
				return Math.floor(value);
			else if (value - Math.ceil(value) < Math.floor(value) - value) 
				return Math.ceil(value);
			else if (value - Math.ceil(value) == Math.floor(value) - value)
				return Math.floor(value);
		} else return null;
	}
});

// LINGUISTIC

cats.filter('countdown', function ($timeout) {
	return function (time) {
		var hours = Math.floor(time/(60*60*1000)),
			minutes = Math.floor((time-(hours*60*60*1000))/(60*1000)),
			seconds = Math.floor((time-(hours*60*60*1000)-(minutes*60*1000))/(1000));

		if (minutes < 10) minutes = '0' + minutes;
		if (seconds < 10) seconds = '0' + seconds;

		return hours + ":" + minutes + ":" + seconds;
	}
});

cats.filter('recentCount', function ($rootScope) {
	return function (entries) {
		var date = new Date();

		//console.log($rootScope.currentUser.previousLogin);

		//if ($rootScope.currentUser.previousLogin !== undefined) date = $rootScope.currentUser.previousLogin;
		var cutoffDate = date - (3 * 24 * 60 * 60 * 1000), // 3 days prior to previous login
			count = 0;

		cutoffDate = new Date(cutoffDate);  // Test to see if this is really necessary...

		_.each(entries, function (elm, i, list) {
			var pubDate = new Date(elm.publishDate);

			if (pubDate >= cutoffDate) count++;
		});
		
		return count;
	}
});

cats.filter('postsSinceDaysAgo', function ($rootScope) {
	return function (value) {
		var date = new Date();

		var cutoffDate = date - (3 * 24 * 60 * 60 * 1000), // 3 days prior to previous login
			count = 0;

		var numDays = Math.floor((new Date() - new Date(cutoffDate))/(24 * 60 * 60 * 1000));  // Test to see if this is really necessary...

		var postUnit = value > 1 ? 'posts' : 'post';
		var dayUnit = numDays > 1 ? 'days' : 'day'; // Not actually necessary since it will always be at least 3 days...

		var message = value + " " + postUnit + " " + " in the last " + numDays + " " + dayUnit;
		
		return message;
	}
});

cats.filter('timeAgo', function () {
  	return function (time) {
		var timeAgo, unit,
			then = new Date(time),
			now = new Date(),
			secondsAgo = (now.getTime()/1000) - (then.getTime()/1000);

		var MINUTE = 60,
			HOUR = 3600,
			DAY = 86400,
			WEEK = 604800,
			YEAR = 31449600;	
				
		if (secondsAgo < 60) {
			timeAgo = secondsAgo;
			unit = "s";
		} else if (secondsAgo >= MINUTE && secondsAgo < HOUR) {
			timeAgo = secondsAgo/MINUTE;
			unit = "m";		
		} else if (secondsAgo >= HOUR && secondsAgo < DAY) {
			timeAgo = secondsAgo/HOUR;
			unit = "h";
		} else if (secondsAgo >= DAY && secondsAgo < WEEK) {
			timeAgo = secondsAgo/DAY;
			unit = "d";
		} else if (secondsAgo >= WEEK && secondsAgo < YEAR) {
			timeAgo = secondsAgo/WEEK;
			unit = "w";
		} else if (secondsAgo >= YEAR) {
			timeAgo = secondsAgo/YEAR;
			unit = "y";
		} 
			
		// Pluralize (or not, if necessary)
		//if (Math.floor(timeAgo) == 1)
		//	unit = unit.substr(0, unit.length - 1);

		if (secondsAgo < 0) timeAgo = '';
		else timeAgo = Math.floor(timeAgo) + "" + unit + " ago";
		
		return timeAgo;
	}
});