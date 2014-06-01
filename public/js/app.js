'use strict';

var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	//$locationProvider.html5Mode(true);			// html5 mode optional
	$routeProvider
		.when('/', {
			templateUrl: '/partials/main.html', 
			controller:  'MainCtrl'	
		})
		.when('/view', {
			templateUrl: '/partials/view.html', 
			controller:  'ViewCtrl'	
		})
		.otherwise({
			redirectTo: '/'
		});

}]);

app.factory('Mongo', function($http, $q) {

	var query = function() {
		var deferredQuery = $q.defer();
		$http({method: 'get', url: '/api'}).success(deferredQuery.resolve).error(deferredQuery.reject);
		return deferredQuery.promise;
	};

	var push = function(params) {
		var deferredPush = $q.defer();
		$http.post('/api', params).success(deferredPush.resolve).error(deferredPush.reject);
		return deferredPush.promise;
	};
	
	return {
		query : query,
		push : push
	};
});

app.controller('MainCtrl', ['$scope','Mongo', function ($scope, Mongo) {
	$scope.myVar = 'angular is working!';
	Mongo.query().then(function (result) {
		$scope.db = (result !== 'null') ? result[0].message : {};
	}, function (reason) {
		console.log('ERROR:', reason);
	});

}]);

app.controller('ViewCtrl',['$scope', 'Mongo', function($scope, Mongo){
	$scope.save = function() {
		if ($scope.test) {
			var params = {message: $scope.test};
			$scope.test='';
			Mongo.push(params).then(function(results) {
				console.log('SAVED:', results.message);
			}, function (reason) {
				console.log('ERROR:', reason);
			});
		}
	};
}]);
