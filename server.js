/* 

~~ Smörgåsbord ~~

*/

//////////////////
// Dependencies //
//////////////////

// NodeJS Utilities
var	https = require('https'),
	http = require("http"),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	events = require('events'),
	eventEmitter = new events.EventEmitter();  // Not in use

// Environment Configuration
	env = process.env.NODE_ENV || 'development',
	port = process.env.PORT || 3000,
	config = require('./config/config')(path, port)[env],

// Express
	express = require('express'),
	app = express(),
	server = http.createServer(app),

// Connect-Mongo
	MongoStore = require('connect-mongo')(express),

// Connet
	connect = require('connect'),

// Piler (Asset Management)
	piler = require('piler'),  // Not in use
	
// SocketIO	
	io = require('socket.io').listen(server),  // Not in use
		
// Passport
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;
	
// Authorization Utilities
	auth = require('./config/middlewares/authorization'),
	
// BCrypt
	bcrypt = require('bcrypt'),

// Crypto
	crypto = require('crypto'),
	
// Underscore
	_ = require('underscore'),

// Bases
	bases = require('bases'),

// Validator
	validator = require('validator'),
	
// Request
	request = require('request'),

// Zlib
	zlib = require('zlib'),

// Async
	async = require('async'),

// Knox
	knox = require('knox'),

// AWS S3
	s3 = knox.createClient({
		key: config.s3.key,
		secret: config.s3.secret,
		bucket: config.s3.bucket,
		region: config.s3.region
	}),

// Mixpanel
	Mixpanel = require('mixpanel'),
	mixpanel = Mixpanel.init(config.mixpanel),
	mixpanel.config.debug = true;

// Mandrill
	mandrill = require('node-mandrill')(process.env.MANDRILL_APIKEY),
	email = require('./app/email')(mandrill),

// Twitter API
	twitter = require('./app/controllers/twitterApi')(request, zlib),

// Feedparser
	Feedparser = require('feedparser'),

// Cron
	cron = require('cron').CronJob,
	
// Mongoose
	mongoose = require('mongoose'),
	
// Imagemagick
	im = require('gm').subClass({ imageMagick: true }),

// Canvas
	Canvas = require('canvas'),
	
// JSDom
	jsdom = require('jsdom'),

// Email Model
	Email = require('./app/models/email')(mongoose, mixpanel),

// Email Templates
	EmailTemplate = require('./app/controllers/emailTemplates')(config),

// Express Settings
	settings = require('./config/express')(app, server, express, passport, config, piler, connect, mongoose, MongoStore, Email, async),

// Models
	Feed = null,
	Entry = require('./app/models/entry')(s3, mongoose, request, im, url, jsdom, async, Feed),
	Activity = require('./app/models/activity')(mongoose),
	Feed = require('./app/models/feed')(mongoose, request, Entry, async, _, Feedparser, Activity),
	Read = require('./app/models/read')(mongoose), // Not in use
	Invite = require('./app/models/invite')(mongoose, bcrypt, crypto),
	Collection = require('./app/models/collection')(mongoose, mixpanel, async, Feed, _),
	Category = require('./app/models/category')(mongoose, mixpanel),
	Snapshot = require('./app/models/snapshot')(mongoose, mixpanel),
	Cat = require('./app/models/user')(s3, mongoose, request, im, url, bcrypt, _, Snapshot, Feed),
	users = require('./app/sockets/users'), 

// Controllers
	routes = require('./app/controllers')(users, passport, config, Cat, Feed, mixpanel, settings, env, crypto, Snapshot),
	api = require('./app/controllers/api')(users, Cat, Feed, _, async, s3, fs, Read, Activity, request, Feedparser, email, validator, Collection, Category, Canvas, Snapshot, im, eventEmitter, bcrypt, crypto, Invite, config, EmailTemplate, bases, twitter);


///////////////////
// Configuration //
///////////////////

// Passport Configuration
require('./config/passport')(Cat, passport, config, LocalStrategy);

// Routing
require('./config/routes')(app, auth, routes, api, config, validator, Email, Invite);

// Sockets
require('./app/sockets/sockets')(users, io, eventEmitter);

// New Relic
require('newrelic');


/////////////////////////
// Database Connection //
/////////////////////////

// Mongoose to MongoDB
require('./config/mongoose')(mongoose, config);


//////////////////
// Start Server //
//////////////////

server.listen(port, function(){
	console.log("Express server listening on port %d in %s mode", this.address().port, env);
});


////////////////
// Expose App //
////////////////

//WARNING: Not sure how to use this or if it's needed (the github model this arch. is based on used it for testing)
module.exports = server;