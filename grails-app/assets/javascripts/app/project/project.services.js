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
 *
 */
services.factory( 'Project', [ 'Resource', function( $resource ) {
    return $resource(icescrum.grailsServer + '/project/:id/:action');
}]);

services.service("ProjectService", ['Project', 'Session', function(Project, Session) {
    this.save = function (project) {
        project.class = 'product';
        return Project.save(project).$promise;
    };
    this.getTeam = function(project) {
        return Project.get({ id: project.id, action: 'team' }, {}, function(team) {
            project.team = team;
        }).$promise;
    };
    this.updateTeam = function (project) {
        // Wrap the product inside a "productd" because by default the formObjectData function will turn it into a "product" object
        // The "product" object conflicts with the "product" attribute expected by a filter which expects it to be either a number (id) or string (pkey)
        return Project.update({ id: project.id, action: 'updateTeam' }, { productd: project }).$promise;
    };
    this.update = function (project) {
        return Project.update({ id: project.id }, { productd: project }).$promise;
    };
    this.leaveTeam = function (project) {
        return Project.update({ id: project.id, action: 'leaveTeam' }, {}).$promise;
    };
    this.archive = function(project) {
        return Project.update({ id: project.id, action: 'archive' }, {}).$promise;
    };
    this['delete'] = function(project) {
        return project.$delete();
    };
    this.authorizedProject = function(action, project) {
        switch (action) {
            case 'update':
            case 'updateTeamMembers': // Should rather be in a team service but depends on the project...
            case 'updateProjectMembers':
                return Session.owner(project) || Session.sm();
            case 'delete':
                return Session.owner(project);
            default:
                return false;
        }
    }
}]);