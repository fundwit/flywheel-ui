import axios from 'axios'
import adapter from 'axios/lib/adapters/http'

axios.defaults.adapter = adapter

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

  async createWork (creationForm) {
    return axios.post(this.withPath('/v1/works'), creationForm).then(r => r.data)
  }

  async queryWork () {
    return axios.get(this.withPath('/v1/works'), {})
      .then(r => r.data)
  }

  async deleteWork (id) {
    return axios.delete(this.withPath('/v1/works/' + id), {})
  }
}

export default new FlywheelClient('/api')
