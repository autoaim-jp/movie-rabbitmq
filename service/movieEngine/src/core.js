const mod = {}
const store = {}

const init = async ({ setting, output, lib, amqpConnection }) => {
  const amqpPromptChannel = await amqpConnection.createChannel()
  mod.amqpPromptChannel = amqpPromptChannel
  const amqpResponseChannel = await amqpConnection.createChannel()
  mod.amqpResponseChannel = amqpResponseChannel

  mod.setting = setting
  mod.output = output
  mod.lib = lib
}

const handleRequest = async ({ requestJson }) => {
  const { requestId, requestType, fileBuffer } = requestJson
  const responseObj = {}
  const tmpFilePath = '/app/data/uploaded_file'

  if (requestType === 'ping') {
    responseObj.message = 'pong'
    const saveResult = mod.output.saveFile({ filePath: tmpFilePath, fileBuffer })
    // console.log({ saveResult })
  } else {
    console.log('invalid requestType:', requestType)
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
      // console.log('Recieved:', msg.content.toString())
      const SLEEP_MS = mod.setting.getValue('movie.SLEEP_MS')
      // console.log(`sleep ${SLEEP_MS}s`)
      await mod.lib.awaitSleep({ ms: SLEEP_MS })

      const requestJson = JSON.parse(msg.content.toString())

      const { requestId } = requestJson
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

