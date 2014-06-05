/////////////
// Express //
/////////////

module.exports = function (app, server, express, passport, config, piler, connect, mongoose, MongoStore, Email, async) {
	var clientJs = piler.createJSManager();
	var clientCss = piler.createCSSManager();

	clientJs.bind(app, server);
	clientCss.bind(app, server);

	app.configure(function(){
		
		// Templates
		
		app.set('views', config.root + '/app/views');
		app.set('view engine', 'ejs');
		
		// Other Middleware

		app.use(express.compress());
		app.use(express.favicon());
		app.use(express.bodyParser());
		app.use(express.cookieParser());
		//app.use(express.methodOverride());
		
		// Asset Management

    	// CSS
    	//clientCss.addFile(config.root + "/dist/main.css");
    	//clientCss.addFile(config.root + "/public/css/normalize.css");
    	clientCss.addUrl("//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css");
    	clientCss.addUrl("//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css");
    	clientCss.addUrl("http://fonts.googleapis.com/css?family=Open+Sans:400italic,400,700,600,800");
    	//clientCss.addFile("app", config.root + "/public/css/lib/bootstrap-responsive.css");
    	//clientCss.addFile("admin", config.root + "/src/css/lib/bootstrap.css");
    	//clientCss.addFile("app", config.root + "/public/css/lib/bootstrap-tooltip-tables-grid.css");
    	//clientCss.addFile("app", config.root + "/public/css/main.css");
    	//clientCss.addFile("admin", config.root + "/src/css/admin.css");

	    // JS
	    //clientJs.addFile(config.root + "/dist/pictorally.min.js");
	    //clientJs.addUrl("http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.js");
	    //clientJs.addUrl("http://code.angularjs.org/1.1.5/angular.js");
	    //clientJs.addUrl("http://code.angularjs.org/1.1.5/angular-cookies.js");
	    //clientJs.addUrl("http://code.angularjs.org/1.1.5/angular-sanitize.js");
	    //clientJs.addUrl("http://angular-ui.github.io/bootstrap/ui-bootstrap-tpls-0.6.0.js");
	    //clientJs.addFile(config.root + "/public/js/lib/bootstrap.js");
	    //clientJs.addFile("app", config.root + "/public/js/lib/bootstrap-tooltip.js");
	    //clientJs.addFile(config.root + "/public/js/lib/ui-bootstrap-custom-0.6.0.js");
	    //clientJs.addFile(config.root + "/public/js/lib/modernizr2-6-2custom.js");
	    //clientJs.addFile(config.root + "/public/js/app.js");
	    //clientJs.addFile("app", config.root + "/public/js/routes.js");
	    //clientJs.addFile("admin", config.root + "/src/js/adminRoutes.js");
	    //clientJs.addFile(config.root + "/public/js/controllers.js");
	    //clientJs.addFile(config.root + "/public/js/directives.js");
	    //clientJs.addFile(config.root + "/public/js/components.js");
	    //clientJs.addFile(config.root + "/public/js/filters.js");
	    //clientJs.addFile(config.root + "/public/js/services.js");
	    //clientJs.addFile(config.root + "/public/js/lib/angular/angular-resource.js");
	    //clientJs.addFile(config.root + "/public/js/lib/underscore-1.5.1/underscore1-5-1.js");
	    //clientJs.addUrl("/socket.io/socket.io.js");

		// Routing
		
		app.use('/assets', express.static(config.root + '/dist/'));
		app.use('/template', express.static(config.root + '/bower_components/angular-ui-bootstrap/template/'));

		// set a cookie
		app.use(function (req, res, next) {
			// check if client sent cookie
			var cookie = req.cookies.smorgasbord;
			
			if (cookie === undefined) {
				// no: set a new cookie
				var randomNumber = Math.random().toString(),
					cookie = randomNumber.substring(2, randomNumber.length);
				res.cookie('smorgasbord', cookie, { maxAge: 1000*60*60*24*1 });
				console.log('cookie created successfully: %s', cookie);

			} else {
				// yes, cookie was already present 
				console.log('cookie exists', cookie);

				// Check for matches, auth if possible here...
			}

			Email.findOne({ cookieId: cookie }, function(err, email) {
				if (email) {
					console.log('Cookie has email: ' + email.emailAddress);
					req.pctEmail = email.emailAddress; 
				} else {
					console.log("No email for cookie.");
					req.pctEmail = null;
				}

				next(); // <-- important!
			});
		});

		app.use(express.session({
		    secret:'keyboard cat',
		    maxAge: new Date(Date.now() + 3600000),
		    store: new MongoStore(
		        {url:config.db},
		        function(res){
		            //console.log("error: " + err || 'connect-mongodb setup ok');
		            //console.dir(res);
		        })
		}));
		app.use(passport.initialize());
		app.use(passport.session());

		// set user
		app.use(function (req, res, next) {
			
			if (req.isAuthenticated()) {
				mixpanel.people.set(req.user._id, {
					ip: req.connection.localAddress,
					$email: req.user.email,
					$first_name: req.user.firstName,
					$last_name: req.user.lastName,
					$name: req.user.firstName + " " + req.user.lastName,
					$username: req.user.username
					//Test: 3
				});
			}

			next(); // <-- important!

		});

		app.use(app.router);
		/* app.use(function(req, res) {
			
			// Use res.sendFile, as it streams instead of reading the file into memory.
			
			res.type('text/html');
			res.sendfile(config.root + '/public/index.html');
		}); */
		
		// Handle Errors
		
		app.use(function(err, req, res, next){
			console.log('UNKNOWN ERROR: %s', err);
			res.status(500);
			res.redirect('/error');
		});	
	});
	
	app.configure('development', function(){
	  	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	  	app.use(express.logger('dev'));
	});
	
	app.configure('production', function(){
	  app.use(express.errorHandler());
	});

	return {
		clientCss: clientCss,
		clientJs: clientJs
	}
}