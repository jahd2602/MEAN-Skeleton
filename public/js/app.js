'use strict';

var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	//$locationProvider.html5Mode(true);
	$routeProvider
		.when('/', {templateUrl: '/partials/main.html', controller:  'MainCtrl'	})
		.when('/view', {templateUrl: '/partials/view.html', controller:  'MainCtrl'	})
		.otherwise({redirectTo: '/'});

}]);

app.controller('MainCtrl', ['$scope', function ($scope) {
	$scope.myVar = 'angular is working!';
}]);