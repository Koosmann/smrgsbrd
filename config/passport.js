//////////////
// Passport //
//////////////

module.exports = function (Cat, passport, config, LocalStrategy) {
	console.log("CAT");
	
	passport.use(new LocalStrategy({
		usernameField: 'username',
	  },
	  function(username, password, done) {
		
		// Find the user by username.  If there is no user with the given
		// username, or the password is not correct, set the user to `false` to
		// indicate failure.  Otherwise, return the authenticated `user`.
		
		console.log("Cat about to auth");
		//console.dir(username);
		//console.dir(req);
		//console.dir(username);
		//console.dir(password);
		//console.dir(done);
		
		Cat.authenticate(username.toLowerCase(), password, function(err, user) {
			
			if (!user) {
				return done(null, false, { message: 'Incorrect username or password.' });
			}
			
			return done(err, user);
		});
	  }
	));
	
	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});
	
	passport.deserializeUser(function(id, done) {		
		Cat.findById(id, function (err, user) {
			done(err, user);
		});
	});
}