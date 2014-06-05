'use strict';

/* Route Module */

cats.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider.
    	// Main site
    	//when('/', {templateUrl: '/partials/outside/horizontalCats',   controller: 'Cats', reloadOnSearch: false}).
      //when('/home', {templateUrl: '/partials/inside/home',   controller: 'Home', reloadOnSearch: false}).
    	//when('/about', {templateUrl: '/partials/outside/about',   controller: 'Cats', reloadOnSearch: false}).
      when('/', {templateUrl: '/partials/outside/intro',   controller: 'Intro', reloadOnSearch: false}).
      when('/invite', {templateUrl: '/partials/outside/intro',   controller: 'Intro', reloadOnSearch: false}).
      when('/collection/:id', {templateUrl: '/partials/outside/collection',   controller: 'Collection', reloadOnSearch: false}).
      when('/feed/:id', {templateUrl: '/partials/outside/feedProfile',   controller: 'Feed', reloadOnSearch: false}).
      when('/feed', {templateUrl: '/partials/inside/blogs',   controller: 'Cats', reloadOnSearch: true}).
      when('/list/:list', {templateUrl: '/partials/inside/blogs',   controller: 'Cats', reloadOnSearch: true}).
      when('/favorites', {templateUrl: '/partials/inside/blogs',   controller: 'Cats', reloadOnSearch: true}).
      when('/collections', {templateUrl: '/partials/inside/collections',   controller: 'Collections', reloadOnSearch: false}).
      when('/directory', {templateUrl: '/partials/inside/directory',   controller: 'Directory', reloadOnSearch: false}).
      when('/snapshots', {templateUrl: '/partials/inside/snapshots',   controller: 'Snapshots', reloadOnSearch: false}).
      when('/account', {templateUrl: '/partials/inside/account',   controller: 'Account', reloadOnSearch: false}).
      when('/user/:username', {templateUrl: '/partials/inside/user-profile',   controller: 'UserProfile', reloadOnSearch: false}).
      when('/feed/:id/find-similar', {templateUrl: '/partials/inside/findSimilar',   controller: 'FindSimilar', reloadOnSearch: false}).
    	//when('/friends', {templateUrl: '/partials/inside/friends',   controller: 'Cats', reloadOnSearch: false}).
      //when('/user/:id', {templateUrl: '/partials/inside/cat',   controller: Cat, reloadOnSearch: false}).
      //when('/feed/:id', {templateUrl: '/partials/inside/feed',   controller: Feed, reloadOnSearch: false}).
    	when('/login', {templateUrl: '/partials/outside/login',   controller: 'Login', reloadOnSearch: false}).
    	when('/register/1/:hash', {templateUrl: '/partials/outside/registerIntro',   controller: 'Register', reloadOnSearch: false}).
      when('/register/2/:hash', {templateUrl: '/partials/outside/registerInfo',   controller: 'Register', reloadOnSearch: false}).
      when('/register/3/:hash', {templateUrl: '/partials/outside/registerInfo2',   controller: 'Register', reloadOnSearch: false}).
      when('/register/4/:hash', {templateUrl: '/partials/inside/registerAvatar',   controller: 'Register', reloadOnSearch: false}).
      //when('/upload-avatar', {templateUrl: '/partials/inside/avatar',   controller: CreateProfile, reloadOnSearch: false}).
		otherwise({redirectTo: '/error'});
      
	$locationProvider.html5Mode(true);
}]);