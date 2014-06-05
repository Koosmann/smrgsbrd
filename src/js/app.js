'use strict';

/* App Module */

var cats = angular.module('cats', ['ngResource', 'ui.bootstrap', 'ngRoute', 'ngCookies', 'ngSanitize', 'ngAnimate']);

cats.config(function($routeProvider, $locationProvider, $httpProvider) {

     var interceptor = ['$location', '$q', '$rootScope', function($location, $q, $rootScope) {
        function success(response) {
            return response;
        }

        function error(response) {

            if(response.status === 401) {
                console.log('UNAUTHORIZED');
                $rootScope.logout();
                //$location.path('/login');
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
});

cats.run(function ($rootScope, AuthService, SocketIO, Device, $templateCache, $cookies, $location, $window, $anchorScroll, $routeParams) {
    $rootScope.user = []; //global variable

    $rootScope.$on('$viewContentLoaded', function() {
        //$templateCache.removeAll();

        $anchorScroll(); 
    });

    $rootScope.$on('$routeChangeSuccess', function () {
        console.log("ROUTE CHANGE SUCCESS");
        $window._gaq.push(['_trackPageview', $location.path()]); 
    });

    // Mixpanel tracking //
    //mixpanel.identify($cookies.pictorally);
    ///////////////////////

    //Check Auth
    
    AuthService.getUser();

    console.log("auth check / " + $rootScope.isLoggedIn + " / " + $rootScope.currentUser);

    Device.runChecks();

});