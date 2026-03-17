import fs from 'fs'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import { v4 as uuidv4 } from 'uuid'
import * as constants from '../constants'
import * as frontendlib from './frontendlib'
import * as utils from '../utils'

interface AuthInfo {
  nlPort: number
  nlToken: string
  nlConnectToken: string
}

export interface WebSocketOptions {
  frontendLibDev?: boolean
}

let ws: any = null
let authInfo: AuthInfo | null = null
let reconnecting = false
let retryHandler: NodeJS.Timeout | null = null

export const start = (options: WebSocketOptions = {}): void => {
  authInfo = getAuthInfo()

  if (!authInfo) {
    retryLater(options)
    return
  }

  const wsUrl = `ws://127.0.0.1:${authInfo.nlPort}?extensionId=js.neutralino.devtools&connectToken=${authInfo.nlConnectToken}`
  ws = new W3CWebSocket(wsUrl)

  ws.onerror = () => {
    retryLater(options)
  }

  ws.onopen = () => {
    utils.log('neu CLI connected with the application.')
    if (options.frontendLibDev && authInfo) {
      frontendlib.bootstrap(authInfo.nlPort)
    }
  }

  ws.onclose = () => {
    if (options.frontendLibDev) {
      frontendlib.cleanup()
    }
  }
}

export const stop = (): void => {
  if (retryHandler) {
    clearTimeout(retryHandler)
  }
  if (ws) {
    ws.close()
    if (fs.existsSync(constants.files.authFile)) {
      fs.unlinkSync(constants.files.authFile)
    }
  }
}

export const dispatch = (event: string, data?: any): void => {
  if (!ws || reconnecting || !authInfo) {
    return
  }
  try {
    ws.send(
      JSON.stringify({
        id: uuidv4(),
        method: 'app.broadcast',
        accessToken: authInfo.nlToken,
        data: {
          event,
          data,
        },
      }),
    )
  } catch (err) {
    utils.error('Unable to dispatch event to the app.')
  }
}

function getAuthInfo(): AuthInfo | null {
  try {
    if (fs.existsSync(constants.files.authFile)) {
      const data = fs.readFileSync(constants.files.authFile, 'utf8')
      return JSON.parse(data) as AuthInfo
    }
  } catch (err) {
    // ignore
  }
  return null
}

function retryLater(options: WebSocketOptions): void {
  reconnecting = true
  retryHandler = setTimeout(() => {
    reconnecting = false
    start(options)
  }, 1000)
}
