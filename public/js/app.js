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

	var save = function(params) {
		var deferredSave = $q.defer();
		$http.post('/api', params).success(deferredSave.resolve).error(deferredSave.reject);
		return deferredSave.promise;
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
		save : save,
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
			Mongo.save(params).then(function(results) {
				$scope.uploaded = true;
				$scope.items.push(results);
				toastr.success('ADDED: ' + results.message);
			}, function (reason) {
				toastr.error('ERROR:', reason);
			});
		}
	};
}]);

app.controller('ViewCtrl',['$scope', 'Mongo', function($scope, Mongo){
	$scope.remove = function(index) {
		var id = $scope.items[index]._id;
		var item = $scope.items[index].message;
		$scope.items.splice(index, 1);
		Mongo.remove(id).then(function(results) {
			toastr.success('DELETED: '+ item);
		}, function (reason) {
			toastr.error('ERROR:', reason);
		});
	};

}]);

app.directive('editable',['$timeout', function($timeout){
	var markup =	'<div>' +
					'<label ng-if="!editMode">{{editable.message}}</label>' +
					'<input class="editBox" type="text" ng-model="editable.message" ng-if="editMode"></input>' +
					'<span ng-transclude></span>'+
					'<div ng-if="!editMode" class="pull-right btn btn-info" ng-click="edit()"><i class="fa fa-pencil"></i></div>' +
					'<div ng-if="editMode" class="pull-right btn btn-info" ng-click="save()"><i class="fa fa-save"></i></div>' +
					'</div>';
	return {
		scope: {
			editable : '='
		},
		transclude : true,
		template: markup,
		restrict: 'A',
		controller : ['$scope', 'Mongo', function($scope, Mongo) {
			$scope.editMode = false;
			$scope.lastText = $scope.editable.message;

			$scope.setEditMode = function() {
				$scope.editMode =! $scope.editMode;
			};
			
			$scope.updateItem = function(id, data) {
				var params = {message: data, id: id};
				Mongo.update(params).then(function(results) {
					toastr.success('UPDATED: ' + $scope.lastText + ' to ' + results.message);
					$scope.lastText = results.message;
				}, function (reason) {
					toastr.error('ERROR:', reason);
				});
			};

			$scope.edit = function() {
				$scope.$broadcast('edit');
			};

			$scope.save = function() {
				$scope.$broadcast('save');
			};			
		}],
		link: function(scope, element, attrs) {
			
			scope.$on('edit', function() {
				scope.setEditMode();
				$timeout(function() {
					element.find('.editBox').focus();
				});
			});
			
			scope.$on('save', function() {
				scope.setEditMode();			
			});
			
			element.on('keypress', function(e) {
				if(e.keyCode === 13){
					$timeout(function() {	
						element.find('.editBox').blur();
					});
				}
			});

			element.on('focusout', function() {
				$timeout(function() {
					scope.setEditMode();
					if (scope.lastText !== scope.editable.message) {
						scope.updateItem(scope.editable._id, scope.editable.message);
					}
				});
			});
		}
  	};
}]);