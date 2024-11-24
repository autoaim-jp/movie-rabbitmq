const setting = {}

const init = ({ env }) => {
  setting.env = {}
  setting.env.SERVER_PORT = env.SERVER_PORT

  setting.env.AMQP_USER = env.AMQP_USER
  setting.env.AMQP_PASS = env.AMQP_PASS
  setting.env.AMQP_HOST = env.AMQP_HOST
  setting.env.AMQP_PORT = env.AMQP_PORT
}

setting.path = {}
setting.path.MOVIE_DIR_PATH = '/app/data/output/'

setting.amqp = {}
setting.amqp.REQUEST_QUEUE = 'movie-request-queue'
setting.amqp.RESPONSE_QUEUE = 'movie-response-queue'

setting.key = {}
setting.key.FORM_UPLOAD = 'file'
setting.key.FILE_LIST_UPLOAD = 'fileList[]'

setting.api = {}
const API_ROOT_PATH = '/api/v1'
setting.api.REGISTER_PROMPT_PING = `${API_ROOT_PATH}/prompt/register/ping`
setting.api.REGISTER_PROMPT_DUMMY = `${API_ROOT_PATH}/prompt/register/dummy`
setting.api.REGISTER_PROMPT_MAIN = `${API_ROOT_PATH}/prompt/register/main`
setting.api.LOOKUP_RESPONSE = `${API_ROOT_PATH}/response/lookup`
setting.api.GET_FILE_LIST = `${API_ROOT_PATH}/file/list`
setting.api.GET_FILE_CONTENT = `${API_ROOT_PATH}/file/content`

const getList = (...keyList) => {
  /* eslint-disable no-param-reassign */
  const constantList = keyList.reduce((prev, key) => {
    let value = setting
    for (const keySplit of key.split('.')) {
      value = value[keySplit]
    }
    prev[key.slice(key.lastIndexOf('.') + 1)] = value
    return prev
  }, {})
  for (const key of keyList) {
    if (constantList[key.slice(key.lastIndexOf('.') + 1)] === undefined) {
      throw new Error(`[error] undefined setting constant: ${key}`)
    }
  }
  return constantList
}


const getValue = (key) => {
  let value = setting
  for (const keySplit of key.split('.')) {
    value = value[keySplit]
  }
  return value
}

export default {
  init,
  getList,
  getValue,
}

