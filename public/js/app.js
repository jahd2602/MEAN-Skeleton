'use strict';

var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	//$locationProvider.html5Mode(true);
	$routeProvider
		.when('/', {templateUrl: '/partials/main.html', controller:  'MainCtrl'	})
		.when('/view', {templateUrl: '/partials/view.html', controller:  'ViewCtrl'	})
		.otherwise({redirectTo: '/'});

}]);

app.factory('Mongo', function($http, $q) {

	var query = function() {
		var deferred = $q.defer();
		$http({method: 'get', url: '/api'}).success(deferred.resolve).error(deferred.reject);
		return deferred.promise;
	};

	var push = function(params) {
		$http.post('/api', params).
		success(function() {
			console.log('SAVED: ' + params.message);
		})
		.error(function() {
			console.log('db save error');
		});
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
		console.log('ERROR', reason);
	});

}]);

app.controller('ViewCtrl',['$scope', 'Mongo', function($scope, Mongo){
	$scope.save = function() {
		var params = {message: $scope.test};
		if ($scope.test) {
			$scope.test='';
			Mongo.push(params);
		}
	};
}]);
