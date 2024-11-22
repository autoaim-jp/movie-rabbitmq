const mod = {}
const store = {}

const init = async ({ setting, lib, amqpConnection }) => {
  const amqpChannel = await amqpConnection.createChannel()
  mod.amqpChannel = amqpChannel

  mod.setting = setting
  mod.lib = lib
}

const _getPingRequest = ({ requestId, fileBuffer, rightTopText, leftTopText, rightBottomText }) => {
  const requestType = 'ping'

  const delimiter = Buffer.from('|')
  const messageBuffer = Buffer.concat([
    Buffer.from(requestType),
    delimiter,
    Buffer.from(requestId),
    delimiter,
    Buffer.from(rightTopText),
    delimiter,
    Buffer.from(leftTopText),
    delimiter,
    Buffer.from(rightBottomText),
    delimiter,
    fileBuffer, 
  ])

  return messageBuffer
}

const _getMainDummyRequest = ({ requestId }) => {
  const requestType = 'main_dummy'

  const delimiter = Buffer.from('|')
  const messageBuffer = Buffer.concat([
    Buffer.from(requestType),
    delimiter,
    Buffer.from(requestId),
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
  const messageBuffer = _getMainDummyRequest({ requestId })
  mod.amqpChannel.sendToQueue(queue, messageBuffer)

  const handleResult = { isRegistered: true, requestId }
  return handleResult
}



const handleLookupResponse = ({ requestId }) => {
  const handleResult = store[requestId]
  if (!handleResult) {
    return {  waiting: true }
  }

  return handleResult
}

const startConsumer = async () => {
  const queue = mod.setting.getValue('amqp.RESPONSE_QUEUE') 
  await mod.amqpChannel.assertQueue(queue)

  mod.amqpChannel.consume(queue, (msg) => {
    if (msg !== null) {
      console.log('Recieved:', msg.content.toString())
      mod.amqpChannel.ack(msg)
      const responseJson = JSON.parse(msg.content.toString())
      store[responseJson.requestId] = responseJson
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
  handleLookupResponse,
  startConsumer,
}

