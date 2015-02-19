////////////
// Models //
////////////

module.exports = function (mongoose, bcrypt, crypto) {
	
	// Users
	var InviteSchema = new mongoose.Schema({		
		// Favorite Blog
		favoriteBlog: { type: String, trim: true },

		// Email
		// WARNING: This still needs to validate the email address.
		emailAddress: { type: String, lowercase: true, required: true, unique: true, trim: true },

		// Secret
		// Salt
		salt: { type: String, required: true },
		// Hash
		hash: { type: String, required: true },

		// Registered
		registered: { type: Boolean, default: false },

		// Invites sent
		sentInvites: [{ type: Date, default: Date.now }],

		// Date added
		dateAdded: { type: Date, default: Date.now }
	});

	/*InviteSchema.pre('save', function (next) {
		mixpanel.track("invite request", {
		    emailAddress: this.emailAddress
		});

	 	next();
	});*/

	InviteSchema.virtual('secret').get(function () {
		return this._secret;
	}).set(function (secret) {
		this._secret = secret.toString();
		var salt = this.salt = bcrypt.genSaltSync(10);
		this.hash = crypto.createHmac('sha1', this.salt).update(this._secret).digest('hex');
	});

	return mongoose.model('Invite', InviteSchema, 'invites');
}