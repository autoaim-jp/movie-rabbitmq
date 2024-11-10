const mod = {}
const store = {}

const init = async ({ setting, lib, amqpConnection }) => {
  const amqpPromptChannel = await amqpConnection.createChannel()
  mod.amqpPromptChannel = amqpPromptChannel
  const amqpResponseChannel = await amqpConnection.createChannel()
  mod.amqpResponseChannel = amqpResponseChannel

  mod.setting = setting
  mod.lib = lib
}

const handleRequest = async ({ requestJson }) => {
  const { requestId, requestType } = requestJson
  const responseObj = {}

  if (requestType === 'ping') {
    responseObj.message = 'pong'
  }

  return responseObj
}


const startConsumer = async () => {
  const promptQueue = mod.setting.getValue('amqp.REQUEST_QUEUE') 
  await mod.amqpPromptChannel.assertQueue(promptQueue)

  const responseQueue = mod.setting.getValue('amqp.RESPONSE_QUEUE') 
  await mod.amqpResponseChannel.assertQueue(responseQueue)

  mod.amqpPromptChannel.consume(promptQueue, async (msg) => {
    if (msg !== null) {
      console.log('Recieved:', msg.content.toString())
      const SLEEP_MS = mod.setting.getValue('movie.SLEEP_MS')
      console.log(`sleep ${SLEEP_MS}s`)
      await mod.lib.awaitSleep({ ms: SLEEP_MS })

      const requestJson = JSON.parse(msg.content.toString())

      const responseObj = await handleRequest({ requestJson })
      console.log('movie response:')
      console.log(responseObj)

      const responseJson = { requestId, response: responseObj }
      const responseJsonStr = JSON.stringify(responseJson)
      mod.amqpResponseChannel.sendToQueue(responseQueue, Buffer.from(responseJsonStr))

      mod.amqpPromptChannel.ack(msg)
    } else {
      console.log('Consumer cancelled by server')
      throw new Error()
    }
  })
}

export default {
  init,
  startConsumer,
}

