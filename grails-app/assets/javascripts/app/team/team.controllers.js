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
controllers.controller('teamCtrl', ['$scope', '$http', '$filter', 'Session', function($scope, $http, $filter, Session) {

    $scope.team = {};
    $scope.searchTeam = function(val){
        return $http.get($scope.serverUrl+ '/team/search', {
            params: {
                value: val
            }
        }).then(function(response){
            return response.data;
        });
    };

    $scope.warning = { on: false };

    $scope.selectTeam = function($item, $model, $label){
        $scope.team = $model;
        $scope.team.selected = true;
        //Add current user to the team
        if (!$scope.team.id){
            $scope.team.class = 'team';
            var current = angular.copy(Session.user);
            $scope.team.members = [];
            $scope.team.members.push(current);
            $scope.team.scrumMasters = [];
            $scope.team.scrumMasters.push(current);
        }
        if ($model.members && $model.scrumMasters){
            $scope.team.members = $model.members.map(function(member){
                member.scrumMaster = _.find($model.scrumMasters, { id: member.id }) ? true : false;
                return member;
            });
        }
        if ($scope.project) {
            var filteredStakeHolders = _.filter($scope.project.stakeHolders, function(u) {
                return !_.find($scope.team.members, { email: u.email });
            });
            var filteredProductOwners = _.filter($scope.project.productOwners, function(u) {
                var member = _.find($scope.team.members, { email: u.email });
                return member ? member.scrumMaster : true;
            });
            if (filteredProductOwners.length != $scope.project.productOwners.length || filteredStakeHolders.length != $scope.project.stakeHolders.length) {
                $scope.warning.on = true;
            }
            $scope.project.stakeHolders = filteredStakeHolders;
            $scope.project.productOwners = filteredProductOwners;
            $scope.team.members = $scope.team.members.map(function(member) {
                member.productOwner = _.find($scope.project.productOwners, { id: member.id }) ? true : false;
                return member;
            });
            $scope.project.team = $scope.team;
        }
        if (!_.isEmpty($model.invitedMembers)) {
            $scope.team.members = $scope.team.members.concat($model.invitedMembers);
        }
        if (!_.isEmpty($model.invitedScrumMasters)) {
            $scope.team.members = $scope.team.members.concat(_.map($model.invitedScrumMasters, function(member) { return _.merge(member, { scrumMaster: true })}));
        }
    };

    if ($scope.teamPromise) {
        $scope.teamPromise.then(function(team) {
            $scope.selectTeam(null, team);
        });
    }

    $scope.unSelectTeam = function() {
        $scope.warning.on = false;
        $scope.project.team = {};
        if ($scope.team.selected) {
            $scope.team = {};
            $scope.member = {};
        }
    };

    $scope.member = {};
    $scope.searchMembers = function(val){
        return $http.get($scope.serverUrl+ '/user/search', {
            params: {
                value: val,
                invit:true
            }
        }).then(function(response) {
            return _.chain(response.data)
                .filter(function(member){
                    var found = false;
                    if ($scope.project){
                        found = _.find($scope.project.stakeHolders, { email: member.email });
                    }
                    if (!found){
                        found = _.find($scope.team.members, { email: member.email });
                    }
                    return !found;
                })
                .map(function(member){
                    member.name = $filter('userFullName')(member);
                    return member;
                })
                .value();
        });
    };

    $scope.addTeamMember = function(member){
        var po = _.find($scope.project.productOwners, { email: member.email });
        if (po) {
            member.scrumMaster = true;
            member.productOwner = true;
            $scope.team.scrumMasters.push(member);
        }
        $scope.team.members.push(member);
        $scope.member = {};
    };

    $scope.removeTeamMember = function(member) {
        _.remove($scope.team.members, { email: member.email });
        _.remove($scope.team.scrumMasters, { email: member.email });
    };

    $scope.scrumMasterChanged = function(member) {
        if (member.scrumMaster) {
            $scope.team.scrumMasters.push(member);
        } else {
            _.remove($scope.team.scrumMasters, { email: member.email }); // equality on email because invited members have no id
        }
    };
}]);