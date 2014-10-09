/*
 * Copyright (c) 2011 Kagilum / 2010 iceScrum Technlogies.
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
package org.icescrum.web.presentation.app

import org.icescrum.core.domain.Release

import org.icescrum.core.domain.Sprint
import org.icescrum.core.domain.Product

import grails.converters.JSON
import grails.plugin.springsecurity.annotation.Secured

@Secured('inProduct()')
class ReleaseController {

    def releaseService
    def sprintService
    def storyService
    def springSecurityService

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def save() {
        withProduct { Product product ->
            def releaseParams = params.release
            if (releaseParams.startDate) {
                releaseParams.startDate = new Date().parse(message(code: 'is.date.format.short'), releaseParams.startDate)
            }
            if (releaseParams.endDate) {
                releaseParams.endDate = new Date().parse(message(code: 'is.date.format.short'), releaseParams.endDate)
            }
            def release = new Release()
            try {
                Release.withTransaction {
                    bindData(release, releaseParams, [include:['name','goal','startDate','endDate']])
                    releaseService.save(release, product)
                }
                withFormat {
                    html { render status: 200, contentType: 'application/json', text: release as JSON }
                    json { renderRESTJSON(text:release, status: 201) }
                    xml  { renderRESTXML(text:release, status: 201) }
                }
            }catch (IllegalStateException e) {
                returnError(exception:e)
            } catch (RuntimeException e) {
                returnError(object:release, exception:e)
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def update() {
        def releaseParams = params.release
        withRelease{ Release release ->
            if (release.state == Release.STATE_DONE){
                returnError(text:message(code:'is.release.error.update.state.done'))
                return
            }
            def startDate = releaseParams.startDate ? new Date().parse(message(code: 'is.date.format.short'), releaseParams.startDate) : release.startDate
            def endDate = releaseParams.endDate ? new Date().parse(message(code: 'is.date.format.short'), releaseParams.endDate) : release.endDate
            Release.withTransaction {
                bindData(release, releaseParams, [include: ['name', 'goal', 'vision']], "release")
                releaseService.update(release, startDate, endDate)
            }
            withFormat {
                html { render status: 200, contentType: 'application/json', text:release as JSON }
                json { renderRESTJSON(text:release) }
                xml  { renderRESTXML(text:release) }
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def delete() {
        withRelease{ Release release ->
            releaseService.delete(release)
            withFormat {
                html { render status: 200, contentType: 'application/json', text: release as JSON }
                json { render status: 204 }
                xml  { render status: 204 }
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def close() {
        withRelease{ Release release ->
            releaseService.close(release)
            withFormat {
                html { render status: 200, contentType: 'application/json', text: release as JSON }
                json { renderRESTJSON(text:release) }
                xml  { renderRESTXML(text:release) }
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def activate() {
        withRelease{ Release release ->
            releaseService.activate(release)
            withFormat {
                html { render status: 200, contentType: 'application/json', text: release as JSON }
                json { renderRESTJSON(text:release) }
                xml  { renderRESTXML(text:release) }
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def autoPlan() {
        withRelease{ Release release ->
            def capacity = params.capacity instanceof String ? params.capacity.replaceAll(',','.').toBigDecimal() : params.capacity
            def plannedStories = storyService.autoPlan(release, capacity)
            withFormat {
                html { render status: 200, contentType: 'application/json', text: plannedStories as JSON }
                json { renderRESTJSON(text:plannedStories, status: 201) }
                xml { renderRESTXML(text:plannedStories, status: 201) }
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def unPlan() {
        withRelease{ Release release ->
            def sprints = Sprint.findAllByParentRelease(release)
            def unPlanAllStories = []
            if (sprints) {
                unPlanAllStories = storyService.unPlanAll(sprints, Sprint.STATE_WAIT)
            }
            withFormat {
                html { render status: 200, contentType: 'application/json', text: [stories: unPlanAllStories, sprints: sprints] as JSON }
                json { render status: 204, contentType: 'application/json', text: '' }
                xml { render status: 204, contentType: 'text/xml', text: '' }
            }
        }
    }

    @Secured('(productOwner() or scrumMaster()) and !archivedProduct()')
    def generateSprints() {
        withRelease{ Release release ->
            def sprints = sprintService.generateSprints(release)
            withFormat {
                html { render status: 200, contentType: 'application/json', text: sprints as JSON }
                json { renderRESTJSON(text:sprints, status: 201) }
                xml { renderRESTXML(text:sprints, status: 201) }
            }
        }
    }

    def index() {
        if (request?.format == 'html'){
            render(status:404)
            return
        }

        withRelease{ Release release ->
            withFormat {
                json { renderRESTJSON(text:release) }
                xml  { renderRESTXML(text:release) }
            }
        }
    }

    def show() {
        redirect(action:'index', controller: controllerName, params:params)
    }

    def list() {
        if (request?.format == 'html'){
            render(status:404)
            return
        }
        withProduct { Product product ->
            withFormat {
                json { renderRESTJSON(text:product.releases) }
                xml  { renderRESTXML(text:product.releases) }
            }
        }
    }
}
