import axios from 'axios'
import adapter from 'axios/lib/adapters/http'

axios.defaults.adapter = adapter
axios.defaults.withCredentials = true

export const stateCategories = [
  { id: 1, name: 'InBacklog' },
  { id: 2, name: 'InProcess' },
  { id: 3, name: 'Done' },
  { id: 4, name: 'Rejected' }
]

export class FlywheelClient {
  constructor (url) {
    if (url === undefined || url === '') {
      url = process.env.API_BASE_URL
    }
    if (url === undefined) {
      url = ''
    }

    if (url.endsWith('/')) {
      url = url.substr(0, url.length - 1)
    }
    this.url = url
  }

  withPath (path) {
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    return `${this.url}${path}`
  }

  async login (form) {
    return axios.post(this.withPath('/v1/sessions'), form).then(r => r.data)
  }

  async logout () {
    return axios.delete(this.withPath('/v1/sessions')).then(r => r.data)
  }

  async detailSession () {
    return axios.get(this.withPath('/v1/session')).then(r => r.data)
  }

  async queryIdentity (form) {
    return axios.get(this.withPath('/me'), form).then(r => r.data)
  }

  async queryWorkflows (projectId) {
    return axios.get(this.withPath(`/v1/workflows?projectId=${projectId}`), {})
      .then(r => r.data)
  }

  async detailWorkflow (id) {
    return axios.get(this.withPath(`/v1/workflows/${id}`), {})
      .then(r => r.data)
  }

  async createWorkflow (creationForm) {
    return axios.post(this.withPath('/v1/workflows'), creationForm).then(r => r.data)
  }

  async updateWorkflowBase (id, workflowChanges) {
    return axios.put(this.withPath('/v1/workflows/' + id), workflowChanges)
  }

  async deleteWorkflow (id) {
    return axios.delete(this.withPath('/v1/workflows/' + id), {})
  }

  async loadAvailableTransitions (flowId, from) {
    return axios.get(this.withPath(`/v1/workflows/${flowId}/transitions?fromState=${from}`)).then(r => r.data)
  }

  async enableWorkflowTransition (flowId, from, to) {
    return axios.post(this.withPath(`/v1/workflows/${flowId}/transitions`), [{ name: from + '->' + to, from: from, to: to }])
      .then(r => r.data)
  }

  async disableWorkflowTransition (flowId, from, to) {
    return axios.request({
      method: 'DELETE',
      url: this.withPath(`/v1/workflows/${flowId}/transitions`),
      data: [{ name: from + '->' + to, from: from, to: to }]
    }).then(r => r.data)
  }

  async updateWorkflowState (flowId, changes) {
    return axios.put(this.withPath(`/v1/workflows/${flowId}/states`), changes)
      .then(r => r.data)
  }

  async createWorkflowState (flowId, stateCreating) {
    return axios.post(this.withPath(`/v1/workflows/${flowId}/states`), stateCreating)
      .then(r => r.data)
  }

  async updateWorkflowStateRangeOrders (flowId, orderUpdating) {
    return axios.put(this.withPath(`/v1/workflows/${flowId}/state-orders`), orderUpdating).then(r => r.data)
  }

  async createWorkTransition (flowID, workID, from, to) {
    return axios.post(this.withPath('/v1/transitions'),
      { flowId: flowID, workId: workID, fromState: from, toState: to }).then(r => r.data)
  }

  async createWorkflowProperty (flowId, requestBody) {
    return axios.post(this.withPath(`/v1/workflows/${flowId}/properties`), requestBody)
      .then(r => r.data)
  }

  async deleteWorkflowProperty (id) {
    return axios.delete(this.withPath(`/v1/workflows/properties/${id}`))
  }

  async listWorkflowPropertyDefinitions (flowId) {
    return axios.get(this.withPath(`/v1/workflows/${flowId}/properties`))
      .then(r => r.data)
  }

  async createWork (creationForm) {
    return axios.post(this.withPath('/v1/works'), creationForm).then(r => r.data)
  }

  async updateWork (id, updateData) {
    return axios.put(this.withPath('/v1/works/' + id), updateData).then(r => r.data)
  }

  async detailWork (id) {
    return axios.get(this.withPath(`/v1/works/${id}`), {})
      .then(r => r.data)
  }

  async queryWorks (projectId) {
    return axios.get(this.withPath(`/v1/works?projectId=${projectId}`), {})
      .then(r => r.data)
  }

  async queryBacklog (projectId) {
    return axios.get(this.withPath(`/v1/works?projectId=${projectId}&stateCategory=1&stateCategory=2`), {})
      .then(r => r.data)
  }

  async deleteWork (id) {
    return axios.delete(this.withPath('/v1/works/' + id), {})
  }

  async archiveWorks (idList) {
    return axios.post(this.withPath('/v1/archived-works'), { workIdList: idList }).then(r => r.data)
  }

  async updateStateRangeOrders (orderUpdating) {
    return axios.put(this.withPath('/v1/work-orders'), orderUpdating).then(r => r.data)
  }

  async queryWorkProcessSteps (workId) {
    return axios.get(this.withPath(`/v1/work-process-steps?workId=${workId}`), {})
      .then(r => r.data)
  }

  async changePassword (changes) {
    return axios.put(this.withPath('/v1/session-users/basic-auths'), changes)
  }

  async queryUsers () {
    return axios.get(this.withPath('/v1/users'), {})
  }

  async createUser (creation) {
    return axios.post(this.withPath('/v1/users'), creation).then(r => r.data)
  }

  async updateUser (userId, changes) {
    return axios.put(this.withPath('/v1/users/' + userId), changes).then(r => r.data)
  }

  async queryProjects () {
    return axios.get(this.withPath('/v1/projects'), {})
  }

  async createProject (creation) {
    return axios.post(this.withPath('/v1/projects'), creation).then(r => r.data)
  }

  async updateProject (projectId, changes) {
    return axios.put(this.withPath(`/v1/projects/${projectId}`), changes).then(r => r.data)
  }

  async queryProjectLabels (projectId, query) {
    let optionalQS = ''
    if (query) {
      optionalQS = optionalQS + '&query=' + query
    }
    return axios.get(this.withPath('/v1/labels?projectId=' + projectId + optionalQS), {}).then(r => r.data)
  }

  async addProjectLabel (creation) {
    return axios.post(this.withPath('/v1/labels'), creation)
  }

  async deleteProjectLabel (id) {
    return axios.delete(this.withPath(`/v1/labels/${id}`), {})
  }

  async addWorkCheckItem (creation) {
    return axios.post(this.withPath('/v1/checkitems'), creation)
  }

  async deleteWorkCheckItem (id) {
    return axios.delete(this.withPath(`/v1/checkitems/${id}`), {})
  }

  async updateWorkCheckItem (id, changes) {
    return axios.patch(this.withPath(`/v1/checkitems/${id}`), changes)
  }

  async queryProjectMembers (projectId) {
    return axios.get(this.withPath('/v1/project-members?projectId=' + projectId), {})
  }

  async deleteProjectMember (projectId, memberId) {
    return axios.delete(this.withPath(`/v1/project-members?projectId=${projectId}&memberId=${memberId}`), {})
  }

  async addProjectMember (creation) {
    return axios.post(this.withPath('/v1/project-members'), creation)
  }

  async queryContributions (query) {
    return axios.post(this.withPath('/v1/contributor-queries'), query).then(r => r.data)
  }

  async beginContribution (workKey, contributorId, checkitemId) {
    return axios.post(this.withPath('/v1/contributions'),
      { workKey: workKey, contributorId: contributorId, checkitemId: checkitemId || 0 })
  }

  async finishContribution (workKey, contributorId, checkitemId, effective) {
    return axios.put(this.withPath('/v1/contributions'), {
      workKey: workKey,
      contributorId: contributorId,
      checkitemId: checkitemId,
      effective: effective
    })
  }

  async addWorkLabelRelation (workId, labelId) {
    return axios.post(this.withPath('/v1/work-label-relations'), { workId: workId, labelId: labelId })
  }

  async deleteWorkLabelRelation (workId, labelId) {
    return axios.delete(this.withPath(`/v1/work-label-relations?workId=${workId}&labelId=${labelId}`), {})
  }

  async assignWorkPropertyValue (workId, name, value) {
    return axios.patch(this.withPath('/v1/work-properties'), { workId: workId, name: name, value: value })
  }

  async queryWorkPropertyValues (workId) {
    return axios.get(this.withPath(`/v1/work-properties?workId=${workId}`))
      .then(r => r.data)
  }
}

export const client = new FlywheelClient('/api')
export default client
