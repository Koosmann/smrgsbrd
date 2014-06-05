/* 

~~ Pictoral.ly - Feed Updater ~~

*/

//////////////////
// Dependencies //
//////////////////

// Nodetime Analytics
if (process.env.NODETIME_ACCOUNT_KEY) {
	require('nodetime').profile({
		accountKey: process.env.NODETIME_ACCOUNT_KEY,
		appName: process.env.APPLICATION_NAME // optional
	});
}

// NodeJS Utilities
var	https = require('https'),
	http = require("http"),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),

// Environment Configuration
	env = process.env.NODE_ENV || 'development',
	port = process.env.PORT || 3000,
	config = require('./config/config')(path)[env],
	
// Underscore
	_ = require('underscore'),
	
// Request
	request = require('request'),

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

// Mandrill
	mandrill = require('node-mandrill')(process.env.MANDRILL_APIKEY),
	email = require('./app/email')(mandrill),

// Mixpanel
	Mixpanel = require('mixpanel'),
	mixpanel = Mixpanel.init(config.mixpanel),

// Feedparser
	Feedparser = require('feedparser'),

// Cron
	cron = require('cron').CronJob,
	
// Mongoose
	mongoose = require('mongoose'),
	
// Imagemagick
	im = require('gm').subClass({ imageMagick: true }),
	
// JSDom
	jsdom = require('jsdom'),

// Cheerio
	cheerio = require('cheerio'),

// Memwatch
	memwatch = require('memwatch'),

// Webkit Devtools Agent
	//agent = require('webkit-devtools-agent'),

// Models
	Activity = require('./app/models/activity')(mongoose),
	Entry = require('./app/models/entry')(s3, mongoose, request, im, url, jsdom, cheerio, async, memwatch, _),
	Email = require('./app/models/email')(mongoose, mixpanel),
	Feed = require('./app/models/feed')(mongoose, request, Entry, async, _, Feedparser, Activity, memwatch),
	Collection = require('./app/models/collection')(mongoose, mixpanel, async, Feed, _);


///////////////////
// Configuration //
///////////////////

// Cron Jobs
require('./app/cronjobs/cronjobs')(cron, async, _, Feed, memwatch, email, env, Activity, Email, Collection);
//process.kill(process.pid, 'SIGUSR2');


/////////////////////////
// Database Connection //
/////////////////////////

// Mongoose to MongoDB
require('./config/mongoose')(mongoose, config);