import dotenv from 'dotenv'
import path from 'path'
import { ulid } from 'ulid'
import express from 'express'
import amqplib from 'amqplib'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import multer from 'multer'

import setting from './setting.js'
import action from './action.js'
import core from './core.js'
import lib from './lib.js'

const asocial = {
  setting, core, action, lib
}
const a = asocial

const _getDefaultRouter = () => {
  const expressRouter = express.Router()

  const appPath = `${path.dirname(new URL(import.meta.url).pathname)}/`
  expressRouter.use(express.static(appPath + a.setting.getValue('static.PUBLIC_STATIC_DIR'), { index: 'index.html', extensions: ['html'] }))

  expressRouter.use(bodyParser.urlencoded({ extended: true }))
  expressRouter.use(bodyParser.json())
  expressRouter.use(cookieParser())

  return expressRouter
}

const _getFunctionRouter = () => {
  const expressRouter = express.Router()

  const { REGISTER_PROMPT_PING, REGISTER_PROMPT_DUMMY, REGISTER_PROMPT_MAIN, LOOKUP_RESPONSE, FORM_UPLOAD, FILE_LIST_UPLOAD, } = a.setting.getList('api.REGISTER_PROMPT_PING', 'api.REGISTER_PROMPT_DUMMY', 'api.REGISTER_PROMPT_MAIN', 'api.LOOKUP_RESPONSE', 'key.FORM_UPLOAD', 'key.FILE_LIST_UPLOAD')

  const fileUploadHandler = a.action.getHandlerFileUpload({
    FORM_UPLOAD,
    parseMultipartFileUpload: a.lib.parseMultipartFileUpload
  })

  // アップロードされたファイルを処理
  const registerPingPromptHandler = a.action.getHandlerRegisterPingPrompt({
    handleRegisterPingPrompt: a.core.handleRegisterPingPrompt
  })
  expressRouter.post(REGISTER_PROMPT_PING, fileUploadHandler, registerPingPromptHandler)

  // main_dummy.shの動作確認
  const registerDummyPromptHandler = a.action.getHandlerRegisterDummyPrompt({
    handleRegisterDummyPrompt: a.core.handleRegisterDummyPrompt
  })
  expressRouter.post(REGISTER_PROMPT_DUMMY, registerDummyPromptHandler)

  // 画像とcsvをアップロード
  const fileListUploadHandler = a.action.getHandlerFileListUpload({
    FILE_LIST_UPLOAD,
    parseMultipartFileListUpload: a.lib.parseMultipartFileListUpload
  })

  const registerMainPromptHandler = a.action.getHandlerRegisterMainPrompt({
    handleRegisterMainPrompt: a.core.handleRegisterMainPrompt
  })
  expressRouter.post(REGISTER_PROMPT_MAIN, fileListUploadHandler, registerMainPromptHandler)

  const lookupResponseHandler = a.action.getHandlerLookupResponse({
    handleLookupResponse: a.core.handleLookupResponse
  })
  expressRouter.get(LOOKUP_RESPONSE, lookupResponseHandler)

  return expressRouter
}

const _getErrorRouter = () => {
  const expressRouter = express.Router()

  expressRouter.get('*', (req, res) => {
    res.status(404)
    return res.end('not found')
  })

  return expressRouter
}

const startServer = ({ app, port }) => {
  app.listen(port, () => {
    console.log(`listen to port: ${port}`)
  })
}

const init = async () => {
  dotenv.config()
  a.setting.init({ env: process.env })
  const { AMQP_USER: user, AMQP_PASS: pass, AMQP_HOST: host, AMQP_PORT: port } = a.setting.getList('env.AMQP_USER', 'env.AMQP_PASS', 'env.AMQP_HOST', 'env.AMQP_PORT')
  const amqpConnection = await a.lib.createAmqpConnection({ amqplib, user, pass, host, port })
  await core.init({ setting, lib, amqpConnection })
  lib.init({ ulid, multer })
}

const main = async () => {
  await a.app.init()
  const expressApp = express()
  expressApp.disable('x-powered-by')

  expressApp.use(_getDefaultRouter())

  expressApp.use(_getFunctionRouter())

  expressApp.use(_getErrorRouter())

  startServer({ app: expressApp, port: a.setting.getValue('env.SERVER_PORT') })

  a.core.startConsumer()
}

const app = {
  init,
  main,
}
asocial.app = app

main()

export default app

