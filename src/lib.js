import dgram from 'dgram'
import EventEmitter from 'events'

// util to support old and new Buffer syntax
const getBufferFromString = (string) => Buffer.from ? Buffer.from(string) : new Buffer(string)


module.exports = class Bulb {
  constructor (ip) {
    this.ip = ip
  }

  /**
   * Scan for lightbulbs on your network
   * @module scan
   * @param {string} filter Only return devices with this class, (ie 'IOT.SMARTBULB')
   * @return {EventEmitter} Emit `light` events when lightbulbs are found
   * @example
```js
// turn first discovered light off
const scan = Bulb.scan()
  .on('light', light => {
    light.set(false)
      .then(status => {
        console.log(status)
        scan.stop()
      })
  })
```
   */
  static scan (filter) {
    const emitter = new EventEmitter()
    const client = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    })
    client.bind(9998, undefined, () => {
      client.setBroadcast(true)
      const msgBuf = Bulb.encrypt(getBufferFromString('{"system":{"get_sysinfo":{}}}'))
      client.send(msgBuf, 0, msgBuf.length, 9999, '255.255.255.255')
    })
    client.on('message', (msg, rinfo) => {
      const decryptedMsg = this.decrypt(msg).toString('ascii')
      const jsonMsg = JSON.parse(decryptedMsg)
      const sysinfo = jsonMsg.system.get_sysinfo

      if (filter && sysinfo.mic_type !== filter) {
        return
      }

      const light = new Bulb(rinfo.address)
      light._info = rinfo
      light._sysinfo = sysinfo
      light.host = rinfo.address
      light.port = rinfo.port
      light.name = sysinfo.alias
      light.deviceId = sysinfo.deviceId

      emitter.emit('light', light)
    })
    emitter.stop = () => client.close()
    return emitter
  }

  /**
   * Get info about the Bulb
   * @module info
   * @return {Promise} Resolves to info
   * @example
```js
// get info about a light
const light = new Bulb('10.0.0.200')
light.info()
  .then(info => {
    console.log(info)
  })
```
   */
  info () {
    return this.send({system: {get_sysinfo: {}}})
      .then(info => info.system.get_sysinfo)
  }

  /**
   * Send a message to a lightbulb (for RAW JS message objects)
   * @module send
   * @param  {Object} msg Message to send to bulb
   * @return {Promise}    Resolves with answer
   * @example
```js
const light = new Bulb('10.0.0.200')
light.send({
  'smartlife.iot.smartbulb.lightingservice': {
    'transition_light_state': {
      'on_off': 1,
      'transition_period': 0
    }
})
.then(response => {
  console.log(response)
})
.catch(e => console.error(e))
```
   */
  send (msg) {
    return new Promise((resolve, reject) => {
      if (!this.ip) {
        return reject(new Error('IP not set.'))
      }
      const client = dgram.createSocket('udp4')
      const message = this.encrypt(getBufferFromString(JSON.stringify(msg)))
      client.send(message, 0, message.length, 9999, this.ip, (err, bytes) => {
        if (err) {
          return reject(err)
        }
        client.on('message', msg => {
          resolve(JSON.parse(this.decrypt(msg).toString()))
          client.close()
        })
      })
    })
  }

  /**
   * Change state of lightbulb
   * @module set
   * @param {Boolean} power     On or off
   * @param {Number}  transition Transition to new state in this time
   * @param {Object}  options    Object containing `mode`, `hue`, `saturation`, `color_temp`, `brightness`
   * @returns {Promise}          Resolves to output of command
   * @example
   * ```js
// turn a light on
const light = new Bulb('10.0.0.200')
light.set(true)
  .then(status => {
    console.log(status)
  })
  .catch(err => console.error(err))
```
   */
  set (power = true, transition = 0, options = {}) {
    const msg = {
      'smartlife.iot.smartbulb.lightingservice': {
        'transition_light_state': {
          'ignore_default': 1,
          'on_off': power ? 1 : 0,
          'transition_period': transition,
          ...options
        }
      }
    }
    return this.send(msg)
      .then(r => r['smartlife.iot.smartbulb.lightingservice']['transition_light_state'])
  }

  /**
   * Get schedule info
   * @module daystat
   * @param  {Number} month Month to check: 1-12
   * @param  {Number} year  Full year to check: ie 2017
   * @return {Promise}      Resolves to schedule info
   * @example
```js
// get the light's schedule for 1/2017
const light = new Bulb('10.0.0.200')
light.schedule(1, 2017)
  .then(schedule => {
    console.log(schedule)
  })
  .catch(e => console.error(e))
```
   */
  daystat (month, year) {
    const now = new Date()
    month = month || now.getMonth() + 1
    year = year || now.getFullYear()
    return this.send({'smartlife.iot.common.schedule': {'get_daystat': {'month': month, 'year': year}}})
      .then(r => r['smartlife.iot.common.schedule']['get_daystat'])
  }

  /**
   * Get cloud info from bulb
   * @module cloud
   * @return {Promise} Resolves to cloud info
   * @example
```js
// get the cloud info for the light
const light = new Bulb('10.0.0.200')
light.cloud()
  .then(info => {
    console.log(info)
  })
  .catch(e => console.error(e))
```
   */
  cloud () {
    return this.send({'smartlife.iot.common.cloud': {'get_info': {}}})
      .then(r => r['smartlife.iot.common.cloud']['get_info'])
  }

  /**
   * Get schedule from bulb
   * @module schedule
   * @return {Promise} Resolves to schedule info
   * @example
```js
// get the bulb's schedule
const light = new Bulb('10.0.0.200')
light.schedule()
  .then(schedule => {
    console.log(schedule)
  })
  .catch(e => console.error(e))
```
   */
  schedule () {
    return this.send({'smartlife.iot.common.schedule': {'get_rules': {}}})
      .then(r => r['smartlife.iot.common.schedule']['get_rules'])
  }

  /**
   * Get operational details from bulb
   * @module details
   * @return {Promise} Resolves to operational details
   * @example
```js
// get some extra details about the light
const light = new Bulb('10.0.0.200')
light.details()
  .then(details => {
    console.log(details)
  })
  .catch(e => console.error(e))
```
   */
  details () {
    return this.send({'smartlife.iot.smartbulb.lightingservice': {'get_light_details': {}}})
      .then(r => r['smartlife.iot.smartbulb.lightingservice']['get_light_details'])
  }

  /**
   * Badly encrypt message in format bulbs use
   * @module encrypt
   * @param  {Buffer} buffer Buffer of data to encrypt
   * @param  {Number} key    Encryption key (default is generally correct)
   * @return {Buffer}        Encrypted data
   * @example
```js
const encrypted = Bulb.encrypt(Buffer.from('super secret text'))
```
   */
  static encrypt (buffer, key = 0xAB) {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      buffer[i] = c ^ key
      key = buffer[i]
    }
    return buffer
  }

  encrypt (buffer, key) {
    return Bulb.encrypt(buffer, key)
  }

  /**
   * Badly decrypt message from format bulbs use
   * @module decrypt
   * @param  {Buffer} buffer Buffer of data to decrypt
   * @param  {Number} key    Encryption key (default is generally correct)
   * @return {Buffer}        Decrypted data
   *  @example
```js
const decrypted = Bulb.decrypt(encrypted)
```
   */
  static decrypt (buffer, key = 0xAB) {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      buffer[i] = c ^ key
      key = c
    }
    return buffer
  }

  decrypt (buffer, key) {
    return Bulb.decrypt(buffer, key)
  }
}
