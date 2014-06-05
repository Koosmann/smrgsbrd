'use strict';

/* Admin Route Module */

cats.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider.
    	// Admin site
    	when('/admin', {templateUrl: '/partials/restricted/admin',   controller: 'Admin', reloadOnSearch: false}).
    	when('/admin/feeds', {templateUrl: '/partials/restricted/adminFeeds',   controller: 'AdminFeeds', reloadOnSearch: false}).
    	when('/admin/users', {templateUrl: '/partials/restricted/adminUsers',   controller: 'AdminUsers', reloadOnSearch: false}).
    	when('/admin/collections', {templateUrl: '/partials/restricted/adminCollections',   controller: 'AdminCollections', reloadOnSearch: false}).
    	when('/admin/categories', {templateUrl: '/partials/restricted/adminCategories',   controller: 'AdminCategories', reloadOnSearch: false}).
        when('/admin/invites', {templateUrl: '/partials/restricted/adminInvites',   controller: 'AdminInvites', reloadOnSearch: false}).
    	//when('/admin/feed/:id/preview', {templateUrl: '/partials/restricted/adminFeedPreview',   controller: 'AdminFeedPreview', reloadOnSearch: false}).
        otherwise({redirectTo: '/error'});
      
	$locationProvider.html5Mode(true);
}]);