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
		$http.delete('/api/' + id).success(deferredRemove.resolve).error(deferredRemove.reject);
		return deferredRemove.promise;
	};

	var update = function(params) {
		var deferredUpdate = $q.defer();
		$http.put('/api/'+params.id, params).success(deferredUpdate.resolve).error(deferredUpdate.reject);
		return deferredUpdate.promise;
	};
	
	return {
		query : query,
		push : push,
		remove : remove,
		update : update
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
				$scope.items.push(results);
				console.log('SAVED:', results);
			}, function (reason) {
				console.log('ERROR:', reason);
			});
		}
	};
}]);

app.controller('ViewCtrl',['$scope', 'Mongo', function($scope, Mongo){
	$scope.remove = function(index) {
		var id = $scope.items[index]._id;
		$scope.test='';
		$scope.items.splice(index, 1);
		Mongo.remove(id).then(function(results) {
			console.log('DELETED:', results);
		}, function (reason) {
			console.log('ERROR:', reason);
		});
	};


}]);

app.directive('editable',[function(){
	var markup = "<div><label class='editInput' ng-if='!editMode'>{{editable.message}}</label><input type='text' ng-model='editable.message' ng-if='editMode'></input></div>";

	return {
		scope: {
			editable : '='
		},
		template: markup,
		restrict: 'A',
		controller : function($scope, Mongo) {
			$scope.editMode = false;

			$scope.setEditMode = function() {
				$scope.editMode =! $scope.editMode;
			};

			$scope.updateDb = function(id, data) {
				var params = {message: data, id: id};
				Mongo.update(params).then(function(results) {
					console.log('UPDDATED:', results);
				}, function (reason) {
					console.log('ERROR:', reason);
				});
			};
		},
		link: function(scope, element, attrs) {
			element.on('dblclick', function() {
				scope.$apply(function() {
					scope.setEditMode();
				});
				scope.$apply(function() {
					element.find('input').focus();
				});
			});
			element.on('focusout', function() {
				scope.$apply(function() {
					scope.setEditMode();
					scope.updateDb(scope.editable._id, scope.editable.message);
				});
			});
		}
  	};
}]);