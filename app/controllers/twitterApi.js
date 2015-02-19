//////////////////
// Twitter Auth //
//////////////////

module.exports = function (request, zlib) {
	console.log("GO GO GADGET TWITTER");

	return {
		getAccessToken: function (callback) {
			var twitterString = new Buffer(encodeURIComponent(process.env.TWITTER_KEY) + ":" + encodeURIComponent(process.env.TWITTER_SECRET)).toString("base64"),
				twitterData = '';

			var options = {
				url: 'https://api.twitter.com/oauth2/token',
				method: 'POST',
				headers: {
					'Host': 'api.twitter.com',
					'User-Agent': 'SMRGSBRD',
					'Authorization': 'Basic ' + twitterString,
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
					'Content-Length': 29,
					'Accept-Encoding': 'gzip'
				},
				body: 'grant_type=client_credentials',
				strictSSL: true
			}

			async.waterfall([function (callback) {
				var callbackCalled = false;
				request(options)
					.pipe(zlib.createGunzip())
			  		.on('error', function (err) {
			  			console.log(err);

			  			if (!callbackCalled) {
			  				callback({ message: "Error authing Twitter: " + err, status: 500 }, null);
			  				callbackCalled = true;
			  			}
			  		}).on('data', function (data) {
			  			twitterData += data.toString('UTF-8');
			  		}).on('end', function () {
			  			if (!callbackCalled) {
			  				callback(null, JSON.parse(twitterData));
			  				callbackCalled = true;
			  			}
			  	});
			}], function (err, twitterData) {
				if (err) console.log(err);
				console.dir(twitterData);
				callback(twitterData);
			});
		}
	}
}