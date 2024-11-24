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
  const bufferAfterCurrentDelimiter = buffer.slice(delimiterIndex + delimiterDelimiterBuffer.length)
  const MAX_PARAMETER_N = 10

  const _getStrAndBuffer = ({ buffer }) => {
    if (buffer === null) {
      return { targetBuffer: null, restBuffer: null }
    }
    const delimiterIndex = buffer.indexOf(currentDelimiter)
    if (delimiterIndex === -1) {
      return { targetBuffer: null, restBuffer: null }
    }
    const targetBuffer = buffer.slice(0, delimiterIndex)

    const restBuffer = buffer.slice(delimiterIndex + currentDelimiter.length)

    return { targetBuffer, restBuffer }
  }

  let currentRestBuffer = bufferAfterCurrentDelimiter
  const splitResultList = []
  const _list = [... new Array(MAX_PARAMETER_N)]
  _list.forEach((_, i) => {
    const { targetBuffer, restBuffer } = _getStrAndBuffer({ buffer: currentRestBuffer })
    currentRestBuffer = restBuffer
    if(targetBuffer === null) {
      return
    }
    splitResultList.push(targetBuffer)
  })

  return splitResultList
}

const _callMainDummy = async ({ requestObj }) => {
  const outputFilePath = '/app/data/output_file.mp4'
  const resultList = []
  const commandList = ['cd', '/app/lib/xmodule-movie-core', '&&', './main_dummy.sh', outputFilePath]

  await mod.lib.fork({ commandList, resultList })

  mod.output.saveFile({ filePath: '/app/data/fork3.log', fileBuffer: Buffer.from(resultList.join('\n')) })

  const resultMovieBuffer = mod.input.readFile({ filePath: outputFilePath })

  return resultMovieBuffer
}

const _callMain = async ({ requestId, titleBuffer, narrationCsvBuffer, imageBufferList }) => {
  const narrationCsvFilePath = '/app/data/narration.csv'
  const outputFilePath = '/app/data/output_file.mp4'
  const IMAGE_EXT = '.png'
  const TEAM_NAME = '"Tempra\nTitans"'
  const VOICE_ENGINE = 'voicevox'

  const title = titleBuffer.toString()
  mod.output.saveFile({ filePath: narrationCsvFilePath, fileBuffer: narrationCsvBuffer })

  const imageDirPath = `/app/data/image_${requestId}/`
  mod.output.makeDir({ dirPath: imageDirPath })
  imageBufferList.forEach((fileBuffer, i) => {
    if(fileBuffer === null) {
      return
    }
    const filePath = `${imageDirPath}${i}${IMAGE_EXT}`
    mod.output.saveFile({ filePath, fileBuffer })
  })
  const resultList = []

  // :TODO
  const tmpTitleImageFilePath = `${imageDirPath}0${IMAGE_EXT}`

  const commandList = ['cd', '/app/lib/xmodule-movie-core', '&&', './main.sh', outputFilePath, narrationCsvFilePath, title, tmpTitleImageFilePath, TEAM_NAME, imageDirPath, VOICE_ENGINE]

  console.log({ commandList })
  await mod.lib.fork({ commandList, resultList })

  mod.output.saveFile({ filePath: '/app/data/fork3.log', fileBuffer: Buffer.from(resultList.join('\n')) })

  const resultMovieBuffer = mod.input.readFile({ filePath: outputFilePath })

  return resultMovieBuffer
}


const handleRequest = async ({ requestBuffer }) => {
  const delimiterDelimiterBuffer = Buffer.from('|')
  const splitResultList = _splitBuffer({ buffer: requestBuffer, delimiterDelimiterBuffer })
  // console.log({ splitResultList })
  const responseObj = {}
  const tmpFilePath = '/app/data/uploaded_file'

  const requestType = splitResultList[0].toString()
  const requestId = splitResultList[1].toString()

  console.log({ requestType, requestId })

  if (requestType === 'ping') {
    responseObj.message = 'pong'
    const fileBuffer = splitResultList[2]
    const saveResult = mod.output.saveFile({ filePath: tmpFilePath, fileBuffer })
    // console.log({ saveResult })
  } else if (requestType === 'main_dummy') {
    const resultMovieBuffer = _callMainDummy()
  } else if (requestType === 'main') {
    const titleBuffer = splitResultList[2]
    const narrationCsvBuffer = splitResultList[3]
    const imageBufferList = splitResultList.slice(4)
    const resultMovieBuffer = _callMain({ requestId, titleBuffer, narrationCsvBuffer, imageBufferList })
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

