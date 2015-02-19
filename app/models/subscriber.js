////////////
// Models //
////////////

module.exports = function (mongoose) {
	
	// Users
	var SubscriberSchema = new mongoose.Schema({		
		// Email
		// WARNING: This still needs to validate the email address.
		email: { type: String, lowercase: true, required: true, unique: true, trim: true },

		feeds: [{ type: mongoose.Schema.types.ObjectId }]
	});

	return mongoose.model('Subscriber', SubscriberSchema, 'subscribers');
}