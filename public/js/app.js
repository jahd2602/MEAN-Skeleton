'use strict';

var app = angular.module('app', ['ngResource', 'ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	//$locationProvider.html5Mode(true);			// html5 mode optional
	$routeProvider
		.when('/', {
			templateUrl: '/partials/main.html', 
			controller:  'MainCtrl'	
		})
		.when('/add', {
			templateUrl: '/partials/add.html', 
			controller:  'AddCtrl'	
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

	var remove = function(id) {
		var deferredRemove = $q.defer();
		var url = '/api/' + id;
		$http.delete(url).success(deferredRemove.resolve).error(deferredRemove.reject);
		return deferredRemove.promise;
	};
	
	return {
		query : query,
		push : push,
		remove : remove
	};
});

app.controller('MainCtrl', ['$scope','Mongo', function ($scope, Mongo) {
	$scope.myVar = 'angular is working!';

	$scope.query = function() {
		Mongo.query().then(function (result) {
			$scope.items = (result !== 'null') ? result : {};
		}, function (reason) {
			console.log('ERROR:', reason);
		});
	};

	$scope.query();
	
}]);

app.controller('AddCtrl',['$scope', 'Mongo', function($scope, Mongo){
	$scope.uploaded = false;

	$scope.save = function() {
		if ($scope.test) {
			var params = {message: $scope.test};
			$scope.test='';
			Mongo.push(params).then(function(results) {
				$scope.uploaded = true;
				console.log('SAVED:', results);
				$scope.query();
			}, function (reason) {
				console.log('ERROR:', reason);
			});
		}
	};
}]);

app.controller('ViewCtrl',['$scope', 'Mongo', function($scope, Mongo){
	$scope.test =$scope.items; 
	
  	$scope.remove = function(index) {
		var id = $scope.items[index]._id;
		$scope.test='';
		Mongo.remove(id).then(function(results) {
			console.log('DELETED:', results);
			$scope.query();
		}, function (reason) {
			console.log('ERROR:', reason);
		});
	};
}]);