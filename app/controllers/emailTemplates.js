///////////
// Email //
///////////
		
module.exports = function (config) {

	return {
		invite: function (invite) {
			var html = "<body style='margin: 0; padding: 0;'>" +
							"<table align='center' border='0' cellpadding='0' cellspacing='0' style='max-width:500px;'>" +
								"<tr>" +
									"<td style='padding: 30px 0px 0px 0px;' align='center'>" +
										"<a href='" + config.url + "'>" +
											"<img src='" + config.url + "/assets/img/logo.png' width='300' height='94.86166007905139' />" +
										"</a>" +
									"</td>" +
								"</tr>" +
								"<tr>" +
									"<td bgcolor='#ffffff' style='padding: 40px 20px 40px 20px;'>" +
										"<table border='0' cellpadding='0' cellspacing='0' width='100%'>" +
											"<tr>" +
										   		"<td style='padding: 10px 0px 0px 0px;color: #111111; font-family: Arial, sans-serif; font-size: 35px;' align='center'>" +
										    		"<b>Your invitation is ready.</b>" +
										   		"</td>" +
										  	"</tr>" +
										  	/*"<tr>" +
										   		"<td style='padding: 10px 0px 10px 0px;color: #111111; font-family: Arial, sans-serif; font-size: 16px;' align='center'>" +
										    		"<b>Start exploring blogs visually.</b>" +
										   		"</td>" +
										  	"</tr>" +*/
										  	"<tr>" +
										   		"<td style='padding: 15px 0px 20px 0px;color: #111111; font-family: Arial, sans-serif; font-size: 20px;' align='center'>" +
										    		"&darr;" +
										   		"</td>" +
										  	"</tr>" +
										  	"<tr>" +
										  		"<td align='center' style='padding: 0px 0px 0px 0px;'>" +
													"<table border='0' cellpadding='0' cellspacing='0' width='300'>" +
														"<tr>" +
												   			"<td bgcolor='#FFC61C' style='border-radius:10px;font-family: Arial, sans-serif; font-size: 16px;' align='center'>" +
												    			"<a href='" + config.url + "/register/1/" + invite.hash + "?utm_source=invite&utm_medium=email&utm_campaign=invite' style='display:inline-block;width:100%;color: #111111;padding: 20px 0px 20px 0px;font-family: Arial, sans-serif; font-size: 16px;text-decoration:none;'>" +
												    				"<b>Register Here</b>" +
												    			"</a>" +
												   			"</td>" +
													  	"</tr>" +
													"</table>" +
												"</td>" +
										  	"</tr>" +
										"</table>" +
									"</td>" +
								"</tr>" +
								"<tr>" +
									"<td style='padding: 10px 10px 10px 10px;color: #AAAAAA;font-family: Arial, sans-serif; font-size: 12px;' align='center'>" +
										"&#9400; 2014 Smörgåsbord - <a href='mailto:hello@visitsmorgasbord.com' style='color: #AAAAAA;text-decoration:none;'>hello@visitsmorgasbord.com</a> - <a href='*|UNSUB:" + config.url + "|*' style='color: #AAAAAA;text-decoration:none;'>unsubscribe</a>" +
									"</td>" +
								"</tr>" +
							"</table>" +
						"</body>";

			return html;
		}
	}

}