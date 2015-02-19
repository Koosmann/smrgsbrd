///////////
// Users //
///////////

	
var users = {};
	
exports.online = function () { return users; }
		
exports.user = function (username) {
	var that = this;
	
	//this.id = id;
	this.username = username;
	this.feeds = [];
	this.sockets = [];
	this.timeIntervalSeconds = 5;
	this.timeOnline = 0;
	
	this.remove = function () {
		clearInterval(timeOnline);
	};
	
	var timeOnline = setInterval( function () {
		console.log(that.username + " has been online for " + that.timeOnline + " seconds.")
		that.timeOnline += this.timeIntervalSeconds;
	}, this.timeIntervalSeconds*1000);
}