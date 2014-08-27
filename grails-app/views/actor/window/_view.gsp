<%@ page import="org.icescrum.core.domain.Story; grails.converters.JSON" %>
%{--
- Copyright (c) 2014 Kagilum SAS.
-
- This file is part of iceScrum.
-
- iceScrum is free software: you can redistribute it and/or modify
- it under the terms of the GNU Affero General Public License as published by
- the Free Software Foundation, either version 3 of the License.
-
- iceScrum is distributed in the hope that it will be useful,
- but WITHOUT ANY WARRANTY; without even the implied warranty of
- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
- GNU General Public License for more details.
-
- You should have received a copy of the GNU Affero General Public License
- along with iceScrum.  If not, see <http://www.gnu.org/licenses/>.
-
- Authors:
-
- Vincent Barrier (vbarrier@kagilum.com)
- Nicolas Noullet (nnoullet@kagilum.com)
--}%
<div id="backlog-layout-window-${controllerName}"
     ui-selectable="selectableOptions"
     ui-selectable-list="actors"
     ng-class="view.asList ? 'list-group' : 'grid-group'"
     class="postits">
    <div ng-class="{ 'ui-selected': isSelected(actor) }"
         data-id="{{ actor.id }}"
         ng-repeat="actor in actors | orderBy:orderBy.current.id:orderBy.reverse"
         ng-controller="actorCtrl"
         class="postit-container">
        <div style="{{ '#f9f157' | createGradientBackground }}"
             class="postit actor #f9f157">
            <div class="head">
                <span class="id">{{ actor.id }}</span>
            </div>
            <div class="content">
                <h3 class="title" ng-bind-html="actor.name | sanitize" ellipsis></h3>
                <div class="description" ng-bind-html="actor.description | sanitize" ellipsis></div>
            </div>
            <div class="tags">
                <a ng-repeat="tag in actor.tags" href="#"><span class="tag">{{ tag }}</span></a>
            </div>
            <div class="actions">
                <span class="action">
                    <a data-toggle="dropdown"
                       ng-class="{ disabled: !authorizedActor('menu') }"
                       tooltip="${message(code: 'todo.is.ui.actions')}"
                       tooltip-append-to-body="true">
                        <i class="fa fa-cog"></i>
                    </a>
                    <ul class="dropdown-menu" ng-include="'actor.menu.html'"></ul>
                </span>
                <span class="action" ng-class="{'active':actor.attachments_count}">
                    <a href="#/actor/{{ actor.id }}/attachments"
                       tooltip="{{ actor.attachments_count }} ${message(code:'todo.is.backlogelement.attachments')}"
                       tooltip-append-to-body="true">
                        <i class="fa fa-paperclip"></i>
                    </a>
                </span>
                <span class="action" ng-class="{'active':actor.stories_count}">
                    <a href="#/actor/{{ actor.id }}/stories"
                       tooltip="{{ actor.stories_count }} ${message(code:'todo.is.actor.stories')}"
                       tooltip-append-to-body="true">
                        <i class="fa fa-tasks"></i>
                        <span class="badge" ng-show="actor.stories_count">{{ actor.stories_count }}</span>
                    </a>
                </span>
            </div>
        </div>
    </div>
</div>