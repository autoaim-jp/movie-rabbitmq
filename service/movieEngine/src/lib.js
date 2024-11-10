const mod = {}

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

export default {
  createAmqpConnection,
  awaitSleep,
}

