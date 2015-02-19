//////////////
// Mandrill //
//////////////

module.exports = function (mandrill) {

	return {
		//send an e-mail
		send: function (to, from, subject, text, html, campaign, callback) {
			
			if (process.env.NODE_ENV == 'development') to = [{email: 'koosmann@gmail.com'}];

			mandrill('/messages/send', {
				message: {
					to: to,
					from_email: from,
					from_name: "Smörgåsbord",
					bcc_address: 'hello@visitsmorgasbord.com',
					subject: subject,
					auto_text: true,
					html: html,
					preserve_recipients: false,
					google_analytics_domains: ['visitsmorgasbord.com'],
					google_analytics_campaign: campaign
				}
			}, function (error, response) {
				//uh oh, there was an error
				if (error) {
					console.log( JSON.stringify(error));
					return callback(error, response);
				} else {
					console.log('SENT');
				
					//everything's good, lets see what mandrill said
					console.log(response);
					return callback(null, response);
				}
			});
		}
	}
}