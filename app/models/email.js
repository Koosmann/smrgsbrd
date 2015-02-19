////////////
// Models //
////////////

module.exports = function (mongoose) {
	
	// Users
	var EmailSchema = new mongoose.Schema({		
		// Email
		// WARNING: This still needs to validate the email address.
		recipient: { 
			type: mongoose.Schema.Types.ObjectId, 
			required: true, 
			ref: 'User' 
		}
	});

	return mongoose.model('Email', EmailSchema, 'emails');
}