const rp = require('request-promise')
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised)

const expect = chai.expect
const GATEWAY = 'https://gateway-stage.dccn.ankr.com'

const logOn = false
const log = {
  info: (...logList) => {
    if (logOn) {
      console.log('--------------')
      console.log(...logList)
    }
  },
  error: (...logList) => {
    if (logOn) {
      console.error('--------------')
      console.error(...logList)
    }
  },
  debug: (...logList) => {
    console.error('--------------')
    console.error(...logList)
  }
}

let testAccessToken,
  testRefreshToken

const setAuthentication =
  ({
    access_token,
    refresh_token
  }) => {
    testAccessToken = access_token
    testRefreshToken = refresh_token
  }

const getAuthentication = () =>
  ({
    accessToken: testAccessToken,
    refreshToken: testRefreshToken
  })

const isAuthenticated =
  () => {
    const {
      accessToken,
      refreshToken
    } = getAuthentication()
    return !!(accessToken && refreshToken)
  }

const authenticate =
  ({
    email,
    password
  }) => {
    return isAuthenticated() ?
      Promise.resolve() :
      req('POST', '/login', {
        email,
        password
      })
      .then(
        ({
          authentication_result: {
            access_token,
            refresh_token
          }
        }) => {
          setAuthentication({
            access_token,
            refresh_token
          })
        })
  }

authenticateWithTestAcct = (email, password) => authenticate({
  email: email,
  password: password
})

const req =
  (method, path, data = {}, headers = {}) => {
    const opt = {
      method,
      uri: `${GATEWAY}${path}`,
      headers,
      json: true
    }

    if (method === 'POST') {
      opt.body = data
    } else {
      opt.qs = data
    }

    log.info('req opt', opt)
    return rp(opt)
  }

const reqA =
  (method, path, data = {}) => {
    const {
      accessToken
    } = getAuthentication()

    return req(method, path, data, {
      Authorization: `Bearer ${accessToken}`
    })
  }

  const reqAWithToken =
  (accessToken, method, path, data = {}) => {
      log.info("--------->>>>>><<<<<<---------- access tokenWithToken", method, path, data, accessToken)
    return req(method, path, data, {
      Authorization: `Bearer ${accessToken}`
    })
  }

const toTS = (str) => (new Date(str)).getTime()

global.chai = chai
global.expect = expect
global.authenticate = authenticate
global.authenticateWithTestAcct = authenticateWithTestAcct
global.req = req
global.reqA = reqA
global.log = log
global.toTS = toTS
global.setAuthentication = setAuthentication
global.reqAWithToken = reqAWithToken

module.exports = {
  GATEWAY,
  getAuthentication,
  authenticate,
  authenticateWithTestAcct,
  reqA,
  req,
  reqAWithToken,
  log
}