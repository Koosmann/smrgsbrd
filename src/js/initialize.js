'use strict';

/* Initialization Module */

cats.run(function ($rootScope, AuthService, SocketIO, $templateCache, $httpProvider) {
    $rootScope.user = []; //global variable

    $rootScope.$on('$viewContentLoaded', function() {
        $templateCache.removeAll();
    });

    var interceptor = ['$location', '$q', function($location, $q) {
        function success(response) {
            return response;
        }

        function error(response) {

            if(response.status === 401) {
                console.log('UNAUTHORIZED');
                $location.path('/login');
                return $q.reject(response);
            } else if (response.status === 403) {
                $location.path('/error');
                 return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }

        return function(promise) {
            return promise.then(success, error);
        }
    }];

    $httpProvider.responseInterceptors.push(interceptor);

    //Check Auth
    
    AuthService.getUser(function (user) {
        if (user) {
            $rootScope.isLoggedIn = 1;
            $rootScope.currentUser = AuthService.currentUser();
            console.log("authenticated / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser);
            
            console.log("GET USER / ADD USER");
            SocketIO.emit('adduser', $rootScope.currentUser);
        }
    });
    console.log("auth check / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser);
});