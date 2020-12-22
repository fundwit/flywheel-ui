const noMock = process.env.NO_MOCK === 'true'

const mock = {
  'GET /api/v1/works': {
    "data": [{
      "id": "101",
      "name": "工作1",
      "group": "default",
      "typeId": "1",
      "createTime": "2020-12-24T15:59:47Z",
      "stateName": "PENDING"
    }, {
      "id": "102",
      "name": "工作2",
      "group": "default",
      "typeId": "1",
      "createTime": "2020-12-24T16:00:34Z",
      "stateName": "PENDING"
    }], "total": 2
  },
  'POST /api/v1/works': (req, res) => {
    res.status(201).json({})
  },
  'DELETE /api/v1/works/:id': (req, res) => {
    res.status(204).send()
  }
}
module.exports = (noMock ? {} : mock);

