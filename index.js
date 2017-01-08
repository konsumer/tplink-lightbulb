const EventEmitter = require('events')

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
    // TODO
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
      // TODO
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

  daystat (month, year) {
    const now = new Date()
    month = month || now.getMonth() + 1
    year = year || now.getFullYear()
    return this.send({'smartlife.iot.common.schedule': {'get_daystat': {'month': month, 'year': year}}})
      .then(r => r['smartlife.iot.common.schedule']['get_daystat'])
  }

  cloud () {
    return this.send({'smartlife.iot.common.cloud': {'get_info': {}}})
      .then(r => r['smartlife.iot.common.cloud']['get_info'])
  }

  schedule () {
    return this.send({'smartlife.iot.common.schedule': {'get_rules': {}}})
      .then(r => r['smartlife.iot.common.schedule']['get_rules'])
  }

  details () {
    return this.send({'smartlife.iot.smartbulb.lightingservice': {'get_light_details': {}}})
      .then(r => r['smartlife.iot.smartbulb.lightingservice']['get_light_details'])
  }
}

