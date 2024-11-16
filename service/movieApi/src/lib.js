const mod = {}
const init = ({ ulid, multer }) => {
  mod.ulid = ulid
  mod.multer = multer
}

const createAmqpConnection = async ({ amqplib, user, pass, host, port }) => {
  const conn = await amqplib.connect(`amqp://${user}:${pass}@${host}:${port}`)
  return conn
}

const getUlid = () => {
  return mod.ulid()
}

const parseMultipartFileUpload = ({ req, formKey }) => {
  const upload = mod.multer({
    storage: mod.multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 * 1024 },
  })

  return new Promise((resolve) => {
    upload.single(formKey)(req, null, (error) => {
      if (error instanceof mod.multer.MulterError) {
        return resolve({ error: true, message: error.message })
      } if (error) {
        return resolve({ error: true, message: 'unkown error' })
      }

      return resolve({ error: false, message: 'success' })
    })
  })
}

export default {
  init,
  createAmqpConnection,
  getUlid,
  parseMultipartFileUpload,
}

