const rp = require('request-promise')
const chai = require('chai')
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised)

const expect = chai.expect
const GATEWAY = 'https://gateway-dev.dccn.ankr.com'
const testEmail = 'test12345@mailinator.com'
const testPassword = 'test12345'
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

const authenticateWithTestAcct = () => authenticate({
  email: testEmail,
  password: testPassword
})

const req =
  (method, path, data = {}, headers = {}) => {
    const opt = {
      method,
      uri: `${GATEWAY}${path}`,
      headers,
      json: true
    }

    if (method === 'POST' || method === 'PUT') {
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

const toTS = (str) => (new Date(str)).getTime()

global.chai = chai
global.expect = expect
global.authenticate = authenticate
global.authenticateWithTestAcct = authenticateWithTestAcct
global.reqA = reqA
global.log = log
global.testEmail = testEmail
global.testPassword = testPassword
global.toTS = toTS

module.exports = {
  GATEWAY,
  testEmail,
  testPassword,
  getAuthentication,
  setAuthentication,
  authenticate,
  reqA,
  log
}
