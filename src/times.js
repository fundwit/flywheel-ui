import moment from 'moment'

export const formatTime = function (time) {
  return moment(time).fromNow(true)
}

export const formatTimeDuration = function (begin, end) {
  if (!begin) {
    return '-'
  }
  if (!end) {
    return moment(begin).fromNow(true) + '+'
  } else {
    return moment(begin).from(end, true)
  }
}
