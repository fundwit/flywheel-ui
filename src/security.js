import _ from 'lodash'

export default {
  install (Vue) {
    Vue.prototype.hasRole = function (role) {
      return _.indexOf(this.$store.state.securityContext.perms, role) >= 0
    }
  }
}
