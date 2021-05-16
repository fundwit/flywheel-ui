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

  async queryIdentity (form) {
    return axios.get(this.withPath('/me'), form).then(r => r.data)
  }

  async queryWorkflows (groupId) {
    return axios.get(this.withPath(`/v1/workflows?groupId=${groupId}`), {})
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

  async queryWorks (groupId) {
    return axios.get(this.withPath(`/v1/works?groupId=${groupId}`), {})
      .then(r => r.data)
  }

  async queryBacklog (groupId) {
    return axios.get(this.withPath(`/v1/works?groupId=${groupId}&stateCategory=1&stateCategory=2`), {})
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
}

export const client = new FlywheelClient('/api')
export default client
