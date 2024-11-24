import dotenv from 'dotenv'
import amqplib from 'amqplib'
import { ulid } from 'ulid'
import fs from 'fs'
import { spawn } from 'child_process'

import setting from './setting.js'
import core from './core.js'
import * as output from './output.js'
import * as input from './input.js'
import lib from './lib.js'

const asocial = {
  setting, core, output, input, lib
}
const a = asocial

const init = async () => {
  dotenv.config()
  a.setting.init({ env: process.env })
  a.lib.init({ spawn, ulid })
  const { AMQP_USER: user, AMQP_PASS: pass, AMQP_HOST: host, AMQP_PORT: port } = a.setting.getList('env.AMQP_USER', 'env.AMQP_PASS', 'env.AMQP_HOST', 'env.AMQP_PORT')
  const amqpConnection = await a.lib.createAmqpConnection({ amqplib, user, pass, host, port })
  await core.init({ setting, output, input, lib, amqpConnection })
  a.output.init({ fs })
  a.input.init({ fs })
}

const main = async () => {
  await a.app.init()
  a.core.startConsumer()
}

const app = {
  init,
  main,
}
asocial.app = app

main()

export default app

