/*
 * Copyright (c) 2014 Kagilum SAS.
 *
 * This file is part of iceScrum.
 *
 * iceScrum is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * iceScrum is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with iceScrum.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors:
 *
 * Vincent Barrier (vbarrier@kagilum.com)
 * Nicolas Noullet (nnoullet@kagilum.com)
 *
 */

var controllers = angular.module('controllers', []);

controllers.controller('appCtrl', ['$scope', '$modal', 'Session', function ($scope, $modal, Session) {
    $scope.currentUser = Session.user;
    $scope.roles = Session.roles;
    // TODO remove, user role change for dev only
    $scope.changeRole = function(newRole) {
        Session.changeRole(newRole);
    };

    $scope.showAbout = function () {
        $modal.open({ templateUrl: 'scrumOS/about' });
    };
    $scope.showAuthModal = function () {
        $modal.open({
            templateUrl: 'login/auth',
            controller:'loginCtrl',
            size:'sm'
        });
    };

    $scope.menubarSortableOptions = {
        revert:true,
        helper:'clone',
        delay: 100,
        items:'> li.menubar',
        placeholder: 'menubar ui-sortable-placeholder',
        stop:$.icescrum.menuBar.stop,
        start:$.icescrum.menuBar.start,
        update:$.icescrum.menuBar.update
    };

}]).controller('loginCtrl',['$scope', '$rootScope','$modalInstance', 'AUTH_EVENTS', 'AuthService', function ($scope, $rootScope, $modalInstance, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
        j_username: '',
        j_password: ''
    };
    $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
            $modalInstance.close();
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
    };
}]);

controllers.controller('sandboxCtrl', ['$scope', '$state', 'StoryStatesByName', 'stories', function ($scope, $state, StoryStatesByName, stories) {
    $scope.orderBy = {
        reverse: false,
        status: false,
        current: {id:'suggestedDate', name:'Date'},
        values:[
            {id:'name', name:'Name'},
            {id:'tasks_count', name:'Tasks'},
            {id:'suggestedDate', name:'Date'},
            {id:'feature.id', name:'Feature'},
            {id:'type', name:'Type'}
        ]
    };
    $scope.goToNewStory = function() {
        $state.go('sandbox.new');
    };
    $scope.defaultStoryState = StoryStatesByName.SUGGESTED;
    $scope.selectableOptions = {
        filter:"> .postit-container",
        cancel: "a",
        stop:function(e, ui, selectedItems) {
            switch (selectedItems.length){
                case 0:
                    $state.go('sandbox.new');
                    break;
                case 1:
                    $state.go($state.params.tabId ? 'sandbox.details.tab' : 'sandbox.details', { id: selectedItems[0].id });
                    break;
                default:
                    $state.go('sandbox.multiple',{listId:_.pluck(selectedItems, 'id').join(",")});
                    break;
            }
        } 
    };
    $scope.stories = stories;
    $scope.isSelected = function(story) {
        if ($state.params.id) {
            return $state.params.id == story.id ;
        } else if ($state.params.listId) {
            return _.contains($state.params.listId.split(','), story.id.toString());
        } else {
            return false;
        }
    };
}]);

controllers.controller('actorsCtrl', ['$scope', '$state', 'actors', function ($scope, $state, actors) {
    $scope.orderBy = {
        reverse: false,
        status: false,
        current: {id:'dateCreated', name:'todo.Date'},
        values:[
            {id:'dateCreated', name:'todo.Date'},
            {id:'name', name:'todo.Name'},
            {id:'stories_count', name:'todo.Stories'}
        ]
    };
    $scope.goToNewActor = function() {
        $state.go('actor.new');
    };
    $scope.selectableOptions = {
        filter:"> .postit-container",
        cancel: "a",
        stop:function(e, ui, selectedItems) {
            switch (selectedItems.length){
                case 0:
                    $state.go('actor.new');
                    break;
                case 1:
                    $state.go($state.params.tabId ? 'actor.details.tab' : 'actor.details', { id: selectedItems[0].id });
                    break;
                default:
                    $state.go('actor.multiple',{listId:_.pluck(selectedItems, 'id').join(",")});
                    break;
            }
        }
    };
    $scope.actors = actors;
    $scope.isSelected = function(feature) {
        if ($state.params.id) {
            return $state.params.id == feature.id ;
        } else if ($state.params.listId) {
            return _.contains($state.params.listId.split(','), feature.id.toString());
        } else {
            return false;
        }
    };
}]);

controllers.controller('featuresCtrl', ['$scope', '$state', 'features', function ($scope, $state, features) {
    $scope.orderBy = {
        reverse: false,
        status: false,
        current: {id:'dateCreated', name:'todo.Date'},
        values:[
            {id:'dateCreated', name:'todo.Date'},
            {id:'name', name:'todo.Name'},
            {id:'stories_count', name:'todo.Stories'},
            {id:'value', name:'todo.Value'}
        ]
    };
    $scope.goToNewFeature = function() {
        $state.go('feature.new');
    };
    $scope.selectableOptions = {
        filter:"> .postit-container",
        cancel: "a",
        stop:function(e, ui, selectedItems) {
            switch (selectedItems.length){
                case 0:
                    $state.go('feature.new');
                    break;
                case 1:
                    $state.go($state.params.tabId ? 'feature.details.tab' : 'feature.details', { id: selectedItems[0].id });
                    break;
                default:
                    $state.go('feature.multiple',{listId:_.pluck(selectedItems, 'id').join(",")});
                    break;
            }
        }
    };
    $scope.features = features;
    $scope.isSelected = function(feature) {
        if ($state.params.id) {
            return $state.params.id == feature.id ;
        } else if ($state.params.listId) {
            return _.contains($state.params.listId.split(','), feature.id.toString());
        } else {
            return false;
        }
    };
}]);