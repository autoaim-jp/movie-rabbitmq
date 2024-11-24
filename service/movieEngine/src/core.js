const mod = {}
const store = {}

const init = async ({ setting, output, input, lib, amqpConnection }) => {
  const amqpPromptChannel = await amqpConnection.createChannel()
  mod.amqpPromptChannel = amqpPromptChannel
  const amqpResponseChannel = await amqpConnection.createChannel()
  mod.amqpResponseChannel = amqpResponseChannel

  mod.setting = setting
  mod.output = output
  mod.input = input
  mod.lib = lib
}

const _splitBuffer = ({ buffer, delimiterDelimiterBuffer }) => {
  const delimiterIndex = buffer.indexOf(delimiterDelimiterBuffer)
  const currentDelimiter = buffer.slice(0, delimiterIndex)
  const bufferAfterCurrentDelimiter = buffer.slice(currentDelimiter.length + delimiterDelimiterBuffer.length)
  const MAX_PARAMETER_N = 10

  const _getStrAndBuffer = ({ buffer }) => {
    if (buffer === null) {
      return { textData: null, restBuffer: null }
    }
    const delimiterIndex = buffer.indexOf(currentDelimiter)
    if (delimiterIndex === -1) {
      return { textData: null, restBuffer: null }
    }
    const textBuffer = buffer.slice(0, delimiterIndex)
    const textData = textBuffer.toString()

    const restBuffer = buffer.slice(delimiterIndex + delimiterDelimiterBuffer.length)

    return { textData, restBuffer }
  }

  let currentRestBuffer = bufferAfterCurrentDelimiter
  const splitResult = {}
  const _list = [... new Array(MAX_PARAMETER_N)]
  _list.forEach((_, i) => {
    const { textData, restBuffer } = _getStrAndBuffer({ buffer: currentRestBuffer })
    splitResult[i] = textData
    currentRestBuffer = restBuffer
  })

  splitResult.fileBuffer = currentRestBuffer

  return splitResult
}

const _callMainDummy = async () => {
  const outputFilePath = '/app/data/output_file.mp4'
  const resultList = []
  const commandList = ['cd', '/app/lib/xmodule-movie-core', '&&', './main_dummy.sh', outputFilePath]

  await mod.lib.fork({ commandList, resultList })

  mod.output.saveFile({ filePath: '/app/data/fork3.log', fileBuffer: Buffer.from(resultList.join('\n')) })

  const resultMovieBuffer = mod.input.readFile({ filePath: outputFilePath })

  return resultMovieBuffer
}

const handleRequest = async ({ requestBuffer }) => {
  const delimiterDelimiterBuffer = Buffer.from('|')
  const requestObj = _splitBuffer({ buffer: requestBuffer, delimiterDelimiterBuffer })
  // console.log({ requestObj })
  const responseObj = {}
  const tmpFilePath = '/app/data/uploaded_file'

  const requestType = requestObj[0]
  const requestId = requestObj[1]

  console.log({ requestType, requestId })

  if (requestType === 'ping') {
    responseObj.message = 'pong'
    const fileBuffer = requestObj[2]
    const saveResult = mod.output.saveFile({ filePath: tmpFilePath, fileBuffer })
    // console.log({ saveResult })
  } else if (requestType === 'main_dummy') {
    const resultMovieBuffer = _callMainDummy()
  } else if (requestType === 'main') {
    console.log('call main')
  } else {
    console.log('invalid requestType:', requestType)
  }

  return { requestId: requestId, responseObj }
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

      const requestBuffer = msg.content

      const { requestId, responseObj } = await handleRequest({ requestBuffer })
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

