const mod = {}
const init = ({ ulid }) => {
  mod.ulid = ulid
}

const createAmqpConnection = async ({ amqplib, user, pass, host, port }) => {
  const conn = await amqplib.connect(`amqp://${user}:${pass}@${host}:${port}`)
  return conn
}

const getUlid = () => {
  return mod.ulid()
}

export default {
  init,
  createAmqpConnection,
  getUlid,
}

