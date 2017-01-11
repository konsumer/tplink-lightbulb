import dgram from 'dgram'
import EventEmitter from 'events'

module.exports = class Bulb {
  constructor (ip) {
    this.ip = ip
  }

  /**
   * Scan for lightbulbs
   * @return {EventEmitter} emit `light` events when lightbulbs are found
   */
  scan () {
    const emitter = new EventEmitter()
    const client = dgram.createSocket('udp4')
    client.bind(9998, undefined, () => {
      client.setBroadcast(true)
      const msgBuf = this.encrypt(new Buffer('{"system":{"get_sysinfo":{}}}'))
      client.send(msgBuf, 0, msgBuf.length, 9999, '255.255.255.255')
    })
    client.on('message', (msg, rinfo) => {
      const light = new Bulb(rinfo.address)
      light.info = Object.assign({}, JSON.parse(this.decrypt(msg).toString()).system.get_sysinfo, rinfo)
      delete light.info.size
      emitter.emit('light', light)
    })
    emitter.stop = () => client.close()
    return emitter
  }

  /**
   * Send a message to a lightbulb
   * @param  {Object} msg Message to send to bulb
   * @return {Promise}    Resolves with answer
   */
  send (msg) {
    return new Promise((resolve, reject) => {
      if (!this.ip) {
        return reject(new Error('IP not set.'))
      }
      const client = dgram.createSocket('udp4')
      const message = this.encrypt(new Buffer(JSON.stringify(msg)))
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
   * @param {Boolean} power     On or off
   * @param {Number}  transition Transition to new state in this time
   * @param {Object}  options    object containing mode,hue,saturation,color_temp,brightness
   */
  set (power = true, transition = 0, options = {}) {
    const msg = {
      'smartlife.iot.smartbulb.lightingservice': {
        'transition_light_state': {
          'on_off': power ? 1 : 0,
          'transition_period': transition
        }
      }
    }
    Object.keys(options).forEach(i => {
      msg['smartlife.iot.smartbulb.lightingservice']['transition_light_state'][i] = options[i]
    })
    return this.send(msg)
      .then(r => r['smartlife.iot.smartbulb.lightingservice']['transition_light_state'])
  }

  /**
   * Get schedule info
   * @param  {Number} month Month to check: 1-12
   * @param  {Number} year  Full year to check: ie 2017
   * @return {Promise}      Resolves to schedule info
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
   * @return {Promise} Resolves to cloud info
   */
  cloud () {
    return this.send({'smartlife.iot.common.cloud': {'get_info': {}}})
      .then(r => r['smartlife.iot.common.cloud']['get_info'])
  }

  /**
   * Get schedule from bulb
   * @return {Promise} Resolves to schedule info
   */
  schedule () {
    return this.send({'smartlife.iot.common.schedule': {'get_rules': {}}})
      .then(r => r['smartlife.iot.common.schedule']['get_rules'])
  }

  /**
   * Get operational details from bulb
   * @return {Promise} Resolves to operational details
   */
  details () {
    return this.send({'smartlife.iot.smartbulb.lightingservice': {'get_light_details': {}}})
      .then(r => r['smartlife.iot.smartbulb.lightingservice']['get_light_details'])
  }

  /**
   * Lamely encrypt message in format bulbs use
   * @param  {Buffer} buffer Buffer of data to encrypt
   * @param  {Number} key    Encryption key (default is generally correct)
   * @return {Buffer}        Encrypted data
   */
  encrypt (buffer, key = 0xAB) {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      buffer[i] = c ^ key
      key = buffer[i]
    }
    return buffer
  }

  /**
   * Lamely decrypt message from format bulbs use
   * @param  {Buffer} buffer Buffer of data to decrypt
   * @param  {Number} key    Encryption key (default is generally correct)
   * @return {Buffer}        Decrypted data
   */
  decrypt (buffer, key = 0xAB) {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      buffer[i] = c ^ key
      key = c
    }
    return buffer
  }
}

