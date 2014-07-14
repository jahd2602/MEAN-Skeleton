'use strict';

var app = angular.module('app', ['ngResource', 'ngRoute', 'ngAnimate']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	
	//$locationProvider.html5Mode(true);			// html5 mode optional
	$routeProvider
		.when('/', {
			templateUrl: '/partials/main.html', 
			controller:  'MainCtrl'	
		})
		.when('/edit', {
			templateUrl: '/partials/edit.html', 
			controller:  'EditCtrl'	
		})
		.otherwise({
			redirectTo: '/'
		});

}]);

app.factory('Mongo', function($http, $q) {

	var query = function() {
		var deferredQuery = $q.defer();
		$http({method: 'get', url: '/api?' + (new Date()).getTime()}).success(deferredQuery.resolve).error(deferredQuery.reject);
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
		Mongo.query().then(function (result) {
            	$scope.items = (result !== 'null') ? result : {};
		}, function (reason) {
			toastr.error('ERROR:', reason);
		});
	
	
}]);
 
app.controller('EditCtrl',['$scope', 'Mongo',  function($scope, Mongo){

	$scope.$on('remove', function(e, index) {
		$scope.items.splice(index, 1);
	});

	Mongo.query().then(function (result) {
		$scope.items = (result !== 'null') ? result : {};
	}, function (reason) {
		toastr.error('ERROR:', reason);
	});
	
	$scope.save = function() {
		if ($scope.test) {
			var params = {message: $scope.test};
			$scope.test='';
			Mongo.save(params).then(function(results) {
				toastr.success('ADDED: ' + results.message);
					Mongo.query().then(function (result) {
		$scope.items = (result !== 'null') ? result : {};
	}, function (reason) {
		toastr.error('ERROR:', reason);
	});
			}, function (reason) {
				toastr.error('ERROR:', reason);
			});
		}
	};	
}]);




app.directive('editable',['$timeout', function($timeout){
	var markup =	'<div>' +
					'<label ng-click="editItem()" class="message" ng-if="!editMode">{{editable.message}}</label>' +
					'<input class="editBox" type="text" ng-model="editable.message" ng-keydown="keypress($event)" ng-if="editMode"></input>' +
					'<div class="pull-right btn btn-danger" ng-click="removeItem()"><i class="fa fa-times"></i></div>' +
					'<div ng-if="!editMode" class="pull-right btn btn-info" ng-click="editItem()"><i class="fa fa-pencil"></i></div>' +
					'<div ng-if="editMode" class="pull-right btn btn-info" ><i class="fa fa-save"></i></div>' +
					'</div>';
	return {
		scope: {
			editable : '=',
			index : '@'
		},
		transclude : true,
		template: markup,
		restrict: 'A',
		controller : ['$scope', 'Mongo', function($scope, Mongo) {
			$scope.editMode = false;
			$scope.lastText = $scope.editable.message;

			$scope.updateItem = function(id, data) {
				var params = {message: data, id: id};
				Mongo.update(params).then(function(results) {
					$scope.lastText = results.message;
				}, function (reason) {
					toastr.error('ERROR:', reason);
				});
			};

			$scope.removeItem = function() {
				Mongo.remove($scope.editable._id).then(function(results) {
					toastr.error('DELETED: ' +$scope.editable.message);
					$scope.$emit('remove', $scope.index);
				}, function (reason) {
					toastr.error('ERROR:', reason);
				});
			};

			$scope.editItem = function() {
				$scope.$broadcast('edit');
			};

			$scope.keypress = function(e) {
				if(e.keyCode != 13) return;
				$scope.$broadcast('blur');
			};

		}],
		link: function(scope, element, attrs) {
			
			scope.$on('edit', function() {
				scope.editMode = true;
				$timeout(function() {
					element.find('.editBox').focus();
				});
			});

			scope.$on('blur', function() {
				$timeout(function() {	
					element.find('.editBox').blur();
				});		
			});

			element.on('focusout', function() {
				$timeout(function() {
					scope.editMode = false;
					if (scope.lastText !== scope.editable.message) {
						scope.updateItem(scope.editable._id, scope.editable.message);
					}
				});
			});
		}
  	};
}]);
