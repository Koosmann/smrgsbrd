/////////////
// Sockets //
/////////////

module.exports = function (users, io, eventEmitter) {
	
	var broadcast;

	/*eventEmitter.on('snapshotTaken', function (snapshot) {
		console.log('SENDING NEW SNAPSHOT');
		broadcast('new snapshot', snapshot);
	});*/
	
	io.configure(function () { 
	  	io.set("transports", ["xhr-polling", "flashsocket"]); 
	  	io.set("polling duration", 10); 
	  	io.set('log level', 1); // reduce logging
	});

	io.on('connection', function (socket) {
		console.log('SOCKET CONNECTION');
		/*broadcast = function (event, args) {
			socket.broadcast.emit(event, args);
		}*/
		
		/*socket.on('adduser', function(username) {
			console.log("ADD USER: " + username);
			console.log(users);

			// Store the user in the socket
			
			if (!users.online[username]) {
				console.log("NEW USER ONLINE");
				
				socket.user = new users.user(username);
			
				console.log("-----");
				console.dir(socket.user);
				console.log("-----");
			
				users.online[socket.user.username] = new Object();
				users.online[socket.user.username].sockets = [];
				users.online[socket.user.username].user = socket.user;
			} else {
				socket.user = users.online[username].user;
			}
			
			// Check for duplicate socket
			var socketCheck = 0;
			
			for (var i=0; i < users.online[socket.user.username].sockets.length; i++) {
				if (users.online[socket.user.username].sockets[i].id == socket.id) {
					console.log("DUCPLICATE SOCKET DETECTED");
					socketCheck = 1;
					return;
				}
			}
			
			if (!socketCheck) {
				console.log("SOCKET ADDED");
				users.online[socket.user.username].sockets.push(socket);
				console.log("+++++");
				console.log(users.online);
				console.log("+++++");
				
				// Send to clients
			
				socket.emit('logged in', socket.user.username);
				socket.broadcast.emit('logged in', socket.user.username);
			}
		});
		
		socket.on('removeuser', function(username) {
			console.log("REMOVE USER: " + socket.user);
			
			socket.disconnect();
		});
		
		socket.on('disconnect', function() {
			console.log("!!!!!!!!!!!!!!!!");
			console.log("DISCONNECT: " + socket.user);
			console.log("!!!!!!!!!!!!!!!!");
			
			if (socket.user) {	
				// Update list of online users.online
					
				if (users.online[socket.user.username].sockets.length != 1) {
					var socketIndex = users.online[socket.user.username].sockets.indexOf(socket);
					users.online[socket.user.username].sockets.splice(socketIndex, 1);
				} else {
					for (var i=0; i < users.online[socket.user.username].user.feeds.length; i++) {
						var feed = users.online[socket.user.username].user.feeds[i];
						
						var userIndex = models.feeds[feed].readers.indexOf(socket.user.username);
						models.feeds[feed].readers.splice(userIndex, 1);
						
						console.log('((((((((((');
						console.dir(models.feeds[feed]);
						console.log('((((((((((');
					}
				
					delete users.online[socket.user.username];
					
					// Send to clients
					
					socket.emit('logged out', socket.user.username);
					socket.broadcast.emit('logged out', socket.user.username);
				}
				
				// Stop tracking user time online
							
				socket.user.remove();
				
				console.log("-----");
				console.log(users.online);
				console.log("-----");
			}
		});*/
		
		socket.on('error', function (err){
			console.log('SOCKET ERROR: ' + err);
		});
		
	});

}