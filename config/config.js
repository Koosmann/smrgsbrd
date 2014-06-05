///////////////////
// Configuration //
///////////////////

module.exports = function (path, port) {
	rootPath = path.normalize(__dirname + '/..');
	
	return {
		development: {
			db: process.env.MONGOHQ_URL,
			url: 'http://localhost:' + port,
			root: rootPath,
			s3: {
				key: process.env.S3_KEY,
				secret:  process.env.S3_SECRET,
				bucket: 'pctrly-dev',
				region: 'us-west-1'
			},
			mixpanel: process.env.MIXPANEL,
			googleAnalytics: process.env.GA,
			app: {
				name: 'Dev - Smörgåsbord'
			},
		},
		staging: {
			db: process.env.MONGOHQ_URL,
			url: 'http://www.visitsmorgasbord.com',
			root: rootPath,
			s3: {
				key: process.env.S3_KEY,
				secret:  process.env.S3_SECRET,
				bucket: 'pctrly-stage',
				region: 'us-west-2'
			},
			mixpanel: process.env.MIXPANEL,
			googleAnalytics: process.env.GA,
			app: {
				name: 'Smörgåsbord - A visual feast.'
			},
		},
		production: {
			db: process.env.MONGOHQ_URL,
			root: rootPath,
			s3: {
				key: process.env.S3_KEY,
				secret:  process.env.S3_SECRET,
				bucket: 'pctrly',
				region: 'us-west-1'
			},
			mixpanel: process.env.MIXPANEL,
			googleAnalytics: process.env.GA,
			app: {
				name: 'Smörgåsbord - A visual feast.'
			},
		},
	}
}
