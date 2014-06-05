///////////////////
// Authorization //
///////////////////

exports.ensureAuth = function (authRequirement, sourceType) {
	return function (req, res, next) {
		var authStatus;

        if (authRequirement) {
            if (req.isAuthenticated() && req.user)
                authStatus = true;
            else authStatus = false;
        } else {
            if (!req.isAuthenticated() && !req.user)
                authStatus = true;
            else authStatus = false;
        }
		var redirectPage = authRequirement ? '/login?ref=' + req.url : '/feed';
		
		console.log("AUTH REQ - %s AUTH STATUS is %s - AUTH is %s", authRequirement, authStatus, req.isAuthenticated());
		console.log("REFERRED FROM: %s", req.url);
		
		if (authStatus) {	
			return next();
		} else {
			switch (sourceType) {
				case 'page':
                    console.log("REDIRECT TO: %s", redirectPage);
					res.redirect(redirectPage);
					break;
				default:
					res.send("Unauthorized :(", 401);
					break;
			}
		}
	}
}

// Warning: Still need to integrate this
exports.requireRole = function (role, self) {
    return function (req, res, next) {
    	console.log("REQUIRE ROLE: %s", role);
    	//console.dir(req.user);
    	console.log("INDEX OF ROLE: %d", req.user.role.indexOf(role));

        console.log("SELF CHECK - %s - %s", req.user.id, req.params.id)

        if (req.user && req.user.role.indexOf(role) >= 0 && req.user.role !== null) {
            req.currentRole = role;
            console.log("CURRENT ROLE: %s", req.currentRole);
            return next();
        } else if (self && req.user.id.toString() == req.params.id) {
            console.log("SELF");
        	return next();
    	} else {
            return res.send("Forbidden :(", 403);
    	}
    }
}

exports.requirePassword = function () {
	return function (req, res, next) {
		req.user.checkPassword(req.body.password.current, function (err, passwordCorrect) {
			console.log("PASSWORD CHECK: %s", passwordCorrect);
			return passwordCorrect ? next(): res.send("Wrong password :(", 400);
		});
	}
}

exports.requireValidInvite = function (Invite) {
    return function (req, res, next) {
    	console.log("REQUIRE UNREGISTERED");
    	
    	Invite.findOne({hash: req.params.hash}, function(err, invite) {
    		console.dir(invite);

    		if (invite && !invite.registered) {
    			console.log('VALID INVITE');
    			next();
    		} /*else if (invite && invite.registered) { 
    			console.log('INVALID INVITE');
    			res.redirect('/');
    		} */ else {
    			console.log('NO INVITE FOUND');
    			res.redirect('/');
    		}
    	})
    }
}

// Warning: Still need to integrate this
/*exports.requireSelf = function () {
    return function (req, res, next) {
    	console.log("REQUIRE SELF: %s - %s", req.params.id, req.user.id);

        if (req.user.id.equals(req.params.id))
            return next();
        else
            return res.send("Forbidden :(", 403);
    }
}*/