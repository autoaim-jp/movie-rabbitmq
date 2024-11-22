const mod = {}

const init = ({ spawn }) => {
  mod.spawn = spawn
}

const createAmqpConnection = async ({ amqplib, user, pass, host, port }) => {
  const conn = await amqplib.connect(`amqp://${user}:${pass}@${host}:${port}`)
  return conn
}

const awaitSleep = ({ ms }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

const fork = ({ commandList, resultList }) => {
  return new Promise((resolve) => {
    const proc = mod.spawn(commandList[0], commandList.slice(1), { shell: true })

    proc.stderr.on('data', (err) => {
      logger.error({ at: 'lib.fork', error: err.toString() })
    })
    proc.stdout.on('data', (data) => {
      logger.info({ at: 'lib.fork', data: data.toString() })
      const result = ((data || '').toString() || '')
      resultList.push(result)
    })
    proc.on('close', (code) => {
      logger.info('spawn', code)
      resolve()
    })
  })
}

export default {
  init,
  createAmqpConnection,
  awaitSleep,
  fork,
}

