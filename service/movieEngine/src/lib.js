const mod = {}

const init = ({ spawn, ulid }) => {
  mod.spawn = spawn
  mod.ulid = ulid
}

const getUlid = () => {
  return mod.ulid()
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
      console.log({ at: 'lib.fork', error: err.toString() })
      const result = ((err || '').toString() || '')
      resultList.push(result)
    })
    proc.stdout.on('data', (data) => {
      console.log({ at: 'lib.fork', data: data.toString() })
      const result = ((data || '').toString() || '')
      resultList.push(result)
    })
    proc.on('close', (code) => {
      console.log('spawn', code)
      resolve()
    })
  })
}

export default {
  init,
  getUlid,
  createAmqpConnection,
  awaitSleep,
  fork,
}

