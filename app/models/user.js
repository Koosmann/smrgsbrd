////////////
// Models //
////////////

module.exports = function (s3, mongoose, request, im, url, bcrypt, _, Snapshot, Feed) {
	
	// Users
	var CatSchema = new mongoose.Schema({
		//Name
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: false, trim: true },

		//Bio
		bio: { type: String, required: false, trim: true },

		// Avatar
		avatar: { type: String, trim: true },
		
		// Username
		username: { type: String, lowercase: true, required: true, unique: true, trim: true },
		
		// Email
		// WARNING: This still needs to validate the email address.
		email: { type: String, lowercase: true, required: true, unique: true, trim: true },
		
		// Gender
		// WARNING: This still needs to validate the input as either 'male' or 'female'.
		gender: { type: String, lowercase: true, trim: true },

		// Birthday
		// WARNING: This still needs validation.
		birthday: { 
					month: { type: String, required: false, trim: true, min: 1, max: 12},
					day: { type: String, required: false, trim: true, min: 1, max: 31},
					year: { type: String, required: false, trim: true, min: 1913, max: 2001},
		},

		// Categories Preferences
		categoryPreferences: 	[{ 
									category: { type: String, required: true, trim: true },
									categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
									rank: { type: Number, required: true }
								}],

		// Favorite Feeds
		favoriteFeeds: 	[{ type: mongoose.Schema.Types.ObjectId }],

		// Hidden Feeds
		hiddenFeeds: 	[{ type: mongoose.Schema.Types.ObjectId }],

		// Saved Feeds
		savedFeeds: 	[{ 
							feedId: { type: mongoose.Schema.Types.ObjectId, required: true },
							categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
						}],

		// Newsletter
		receivesNewsletter: {
			type: Boolean,
			default: false
		},

		// Persmission
		role: [{ type: String, lowercase: true, trim: true }],
	  
		// Password
		salt: { type: String, required: false },
		hash: { type: String, required: false },

		// Last Login
		recentLogin: { type: Date, default: Date.now },
		previousLogin: { type: Date, default: Date.now },

		// Date added
		dateAdded: { type: Date, default: Date.now }
	});

	CatSchema.method('updateLastLogin', function (callback) {
	  	this.previousLogin = this.recentLogin;
	  	this.recentLogin = Date.now();
	  	console.log("UPDATING LAST LOGIN");
	  	console.dir(this);
	  	this.save(function (err) {
	  		if (err) console.log(err);
	  		console.log("LAST LOGIN SAVED");
	  		callback();
	  	})
	});
	
	CatSchema.virtual('password').get(function () {
		return this._password;
	}).set(function (password) {
		this._password = password;
		var salt = this.salt = bcrypt.genSaltSync(10);
		this.hash = bcrypt.hashSync(password, salt);
	});
	
	CatSchema.method('checkPassword', function (password, callback) {
	  bcrypt.compare(password, this.hash, callback);
	});

	CatSchema.method('setPassword', function (password, callback) {
	  	var newPassword;

	  	if (password) {
	  		newPassword = password;
	  		this.password = password;
	  	} else {
		  	/*var specials = '!@#$%^&*()_+{}:"<>?\|[];\,./`~';
			var lowercase = 'abcdefghijklmnopqrstuvwxyz';
			var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			var numbers = '0123456789';

			var all = specials + lowercase + uppercase + numbers;

			var password = '';
			password += specials.pick(1);
			password += lowercase.pick(1);
			password += uppercase.pick(1);
			password += all.pick(3, 10);
			password = password.shuffle();*/

		  	this.password = 'welcome'; //just for now
		  	newPassword = 'welcome';
		}

	  	this.save(function (err) {
	  		if (err) console.log(err);
	  		console.log("PASSWORD SET");
	  		callback(null, newPassword);
	  		newPassword = null;
	  	})
	});
	
	CatSchema.static('authenticate', function (name, password, callback) {
		console.log('Cat \'authenticate\' method initiated.');
	  //this.findOne({ name: {$regex : new RegExp(name, "i")} }, function(err, user) {
	  if (name.match(/@/)) var query = { email: name };
	  else var query = { username: name };
	  
	  this.findOne(query, function(err, user) {
		if (err)
		  return callback(err);
	
		if (!user)
		  return callback(null, false);
	
		user.checkPassword(password, function(err, passwordCorrect) {
		  console.log('Checking password for ' + user.username + '.');
		  
		  if (err)
			return callback(err);
	
			if (!passwordCorrect) {
				console.log("Wrong password.");
				return callback(null, false);
			}
			
			console.log("Password correct!");
	
		  return callback(null, user);
		});
	  });
	});

	CatSchema.method('updateCategoryPreferences', function (callback) {
		var cat = this,
			categories = [],
			snapshots;

					
		async.series([function (callback) {

			//// Get user's snapshots

			Snapshot.find({ userId: cat._id }, function(err, results) {
				if (err) {
					callback({ message: 'Snapshot search error: ' + err, status: 500 });
				} else {
					snapshots = results;
					callback();
				}
			});
		}, function (callback) {

			//// Get ranked categories for each snapshotted feed

			console.log('FAVORITES');
			console.dir(cat.favoriteFeeds);
			console.log('SNAPSHOTS');
			console.dir(_.pluck(snapshots, 'feedId'));
			var feedIds = _.unique(_.pluck(snapshots, 'feedId').concat(cat.favoriteFeeds || []));
			console.log('MERGED LIST');
			console.dir(feedIds);

			Feed.find({ _id: { $in: /*feedIds*/ cat.favoriteFeeds } }, { rankedCategories: 1 }, function (err, feeds) {
				if (err) callback({ message: 'Error finding feeds for user preferences: ' + err, status: 500 });
				else {
					_.each(feeds, function (feed) {
						_.each(feed.rankedCategories, function (elm) {
							var categoryI = _.indexOf(categories, _.findWhere(categories, {category: elm.category}));

							if (categoryI >= 0) {
								categories[categoryI].rank.push(elm.rank);
							} else {
								var newElm = {};

								newElm.category = elm.category;
								newElm.categoryId = elm.categoryId;
								newElm.rank = [elm.rank];
								categories.push(newElm);
							}
						});
					});

					callback();
				}
			});

		}, function (callback) {

			//// Reduce array of categories to one set of averages

			console.log("UNREDUCED PREFS");
			console.dir(categories);

			_.each(categories, function (elm, i, list) {
				list[i].rank = elm.rank.reduce(function(a, b) { return a + b }) / elm.rank.length;
			});

			console.log("REDUCED PREFS");
			console.dir(categories);

			callback();

		}, function (callback) {

			//// Save user's category preferences

			mongoose.model('Cat').findOneAndUpdate({_id: cat._id}, { $set: { categoryPreferences: categories} }, function (err) {
				if (err) {
					callback({ message: 'User save error: ' + err, status: 500 });
				} else {
					callback();
				}
			});

		}], function (err) {

			//// Finish

			if (err) {
				console.log(err);
				callback(null);
			} else {
				callback(true);
			}

			cat = null;
			categories = null;
			snapshots = null;
		});
		
	});

	return mongoose.model('Cat', CatSchema, 'users');
}