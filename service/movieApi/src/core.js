const mod = {}
const store = {}

const init = async ({ setting, output, lib, amqpConnection }) => {
  const amqpChannel = await amqpConnection.createChannel()
  mod.amqpChannel = amqpChannel

  mod.setting = setting
  mod.output = output
  mod.lib = lib
}

const _getPingRequest = ({ requestId, fileBuffer, rightTopText, leftTopText, rightBottomText }) => {
  const requestType = 'ping'

  const currentDelimiter = Buffer.from(mod.lib.getUlid())
  const delimiterDelimiter = Buffer.from('|')
  const messageBuffer = Buffer.concat([
    currentDelimiter,
    delimiterDelimiter,
    Buffer.from(requestType),
    currentDelimiter,
    Buffer.from(requestId),
    currentDelimiter,
    Buffer.from(rightTopText),
    currentDelimiter,
    Buffer.from(leftTopText),
    currentDelimiter,
    Buffer.from(rightBottomText),
    currentDelimiter,
    fileBuffer, 
    currentDelimiter,
  ])

  return messageBuffer
}

const _getDummyRequest = ({ requestId }) => {
  const requestType = 'main_dummy'

  const currentDelimiter = Buffer.from(mod.lib.getUlid())
  const delimiterDelimiter = Buffer.from('|')
  const messageBuffer = Buffer.concat([
    currentDelimiter,
    delimiterDelimiter,
    Buffer.from(requestType),
    currentDelimiter,
    Buffer.from(requestId),
    currentDelimiter,
  ])

  return messageBuffer
}

const _getMainRequest = ({ requestId, fileList, title, narrationCsv }) => {
  const requestType = 'main'

  const currentDelimiter = Buffer.from(mod.lib.getUlid())
  console.log(`delimiter: ${currentDelimiter.toString()}`)
  const delimiterDelimiter = Buffer.from('|')
  let messageBuffer = Buffer.concat([
    currentDelimiter,
    delimiterDelimiter,
    Buffer.from(requestType),
    currentDelimiter,
    Buffer.from(requestId),
    currentDelimiter,
    Buffer.from(title),
    currentDelimiter,
    Buffer.from(narrationCsv),
  ])

  fileList.forEach((file) => {
    console.log({ originalname: file.originalname })
    messageBuffer = Buffer.concat([
      messageBuffer,
      currentDelimiter,
      file.buffer
    ])
  })

  messageBuffer = Buffer.concat([
    messageBuffer,
    currentDelimiter,
  ])

  return messageBuffer
}
const handleRegisterPingPrompt = async ({ fileBuffer, rightTopText, leftTopText, rightBottomText }) => {
  const queue = mod.setting.getValue('amqp.REQUEST_QUEUE') 
  await mod.amqpChannel.assertQueue(queue)

  const requestId = mod.lib.getUlid()
  const messageBuffer = _getPingRequest({ requestId, fileBuffer, rightTopText, leftTopText, rightBottomText })
  mod.amqpChannel.sendToQueue(queue, messageBuffer)

  const handleResult = { isRegistered: true, requestId }
  return handleResult
}

const handleRegisterDummyPrompt = async ({}) => {
  const queue = mod.setting.getValue('amqp.REQUEST_QUEUE') 
  await mod.amqpChannel.assertQueue(queue)

  const requestId = mod.lib.getUlid()
  const messageBuffer = _getDummyRequest({ requestId })
  mod.amqpChannel.sendToQueue(queue, messageBuffer)

  const handleResult = { isRegistered: true, requestId }
  return handleResult
}

const handleRegisterMainPrompt = async ({ fileList, title, narrationCsv }) => {
  const queue = mod.setting.getValue('amqp.REQUEST_QUEUE') 
  await mod.amqpChannel.assertQueue(queue)

  const requestId = mod.lib.getUlid()
  console.log({ requestId, title, narrationCsv })
  const messageBuffer = _getMainRequest({ requestId, fileList, title, narrationCsv })
  mod.amqpChannel.sendToQueue(queue, messageBuffer)

  const handleResult = { isRegistered: true, requestId }
  return handleResult
}


const handleLookupResponse = ({ requestId }) => {
  const handleResult = store[requestId]
  if (!handleResult) {
    return { waiting: true }
  }

  return handleResult
}

const startConsumer = async () => {
  const queue = mod.setting.getValue('amqp.RESPONSE_QUEUE') 
  const MOVIE_DIR_PATH = '/app/data/output/'
  await mod.amqpChannel.assertQueue(queue)

  mod.amqpChannel.consume(queue, (msg) => {
    if (msg !== null) {
      const responseBuffer = msg.content
      console.log('Recieved:', responseBuffer.length)
      mod.amqpChannel.ack(msg)
      const delimiterDelimiterBuffer = Buffer.from('|')
      const splitResultList = mod.lib.parseBufferList({ buffer: responseBuffer, delimiterDelimiterBuffer })

      const requestId = splitResultList[0].toString()
      const requestType = splitResultList[1].toString()

      if (requestType === 'main') {
        const filePath = `${MOVIE_DIR_PATH}${requestId}.mp4`
        const fileBuffer = splitResultList[2]
        mod.output.makeDir({ dirPath: MOVIE_DIR_PATH })
        mod.output.saveFile({ filePath, fileBuffer })
        store[requestId] = 'ready'
      }
    } else {
      console.log('Consumer cancelled by server')
      throw new Error()
    }
  })
}

export default {
  init,
  handleRegisterPingPrompt,
  handleRegisterDummyPrompt,
  handleRegisterMainPrompt,
  handleLookupResponse,
  startConsumer,
}

