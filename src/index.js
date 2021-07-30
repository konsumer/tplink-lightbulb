import dgram from 'dgram'
import EventEmitter from 'events'

export default class TPLSmartDevice {
  constructor (ip) {
    this.ip = ip
  }

  // Scan for lightbulbs on your network
  static scan (filter, broadcast = '255.255.255.255') {
    const emitter = new EventEmitter()
    const client = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    })
    client.bind(9998, undefined, () => {
      client.setBroadcast(true)
      const msgBuf = TPLSmartDevice.encrypt(Buffer.from('{"system":{"get_sysinfo":{}}}'))
      client.send(msgBuf, 0, msgBuf.length, 9999, broadcast)
    })
    client.on('message', (msg, rinfo) => {
      const decryptedMsg = this.decrypt(msg).toString('ascii')
      const jsonMsg = JSON.parse(decryptedMsg)
      const sysinfo = jsonMsg.system.get_sysinfo

      if (filter && sysinfo.mic_type !== filter) {
        return
      }

      const light = new TPLSmartDevice(rinfo.address)
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

  // Send a message to a lightbulb (for RAW JS message objects)
  send (msg) {
    return new Promise((resolve, reject) => {
      if (!this.ip) {
        return reject(new Error('IP not set.'))
      }
      const client = dgram.createSocket('udp4')
      const message = this.encrypt(Buffer.from(JSON.stringify(msg)))
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

  // TODO: wifi needs more testing. it seems very broken.

  // Scans the wifi networks in range of the device
  async listwifi () {
    const r1 = await this.send({
      netif: {
        get_scaninfo: {
          refresh: 1
        }
      }
    })

    if (r1?.netif?.get_scaninfo?.ap_list) {
      return r1.netif.get_scaninfo.ap_list
    } else {
      // on fail, try older message-format
      const r2 = await this.send({
        'smartlife.iot.common.softaponboarding': {
          get_scaninfo: {
            refresh: 1
          }
        }
      })
      if (r2 && r2['smartlife.iot.common.softaponboarding']?.get_scaninfo?.ap_list) {
        return r2['smartlife.iot.common.softaponboarding'].get_scaninfo.ap_list
      }
    }
  }

  // Connects the device to the access point in the parameters
  async connectwifi (ssid, password, keyType = 1, cypherType = 0) {
    const r1 = await this.send({
      netif: {
        set_stainfo: {
          cypher_type: cypherType,
          key_type: keyType,
          password,
          ssid
        }
      }
    })

    if (r1?.netif?.set_stainfo?.err_code === 0) {
      return true
    }

    // on fail, try older message-format

    const r2 = await this.send({
      'smartlife.iot.common.softaponboarding': {
        set_stainfo: {
          cypher_type: cypherType,
          key_type: keyType,
          password,
          ssid
        }
      }
    })
    if (r2['smartlife.iot.common.softaponboarding'] && r2['smartlife.iot.common.softaponboarding'].err_msg) {
      throw new Error(r2['smartlife.iot.common.softaponboarding'].err_msg)
    } else {
      return true
    }
  }

  // Get info about the TPLSmartDevice
  async info () {
    const r = await this.send({ system: { get_sysinfo: {} } })
    return r.system.get_sysinfo
  }

  // Set power-state of lightbulb
  async power (powerState = true, transition = 0, options = {}) {
    const info = await this.info()
    if (typeof info.relay_state !== 'undefined') {
      return this.send({
        system: {
          set_relay_state: {
            state: powerState ? 1 : 0
          }
        }
      })
    } else {
      const r = await this.send({
        'smartlife.iot.smartbulb.lightingservice': {
          transition_light_state: {
            ignore_default: 1,
            on_off: powerState ? 1 : 0,
            transition_period: transition,
            ...options
          }
        }
      })
      return r['smartlife.iot.smartbulb.lightingservice'].transition_light_state
    }
  }

  // Set led-state of lightbulb
  led (ledState = true) {
    return this.send({ system: { set_led_off: { off: ledState ? 0 : 1 } } })
  }

  // Set the name of lightbulb
  async name (newAlias) {
    const info = await this.info()
    return typeof info.dev_name !== 'undefined'
      ? this.send({ system: { set_dev_alias: { alias: newAlias } } })
      : this.send({ 'smartlife.iot.common.system': { set_dev_alias: { alias: newAlias } } })
  }

  // Get schedule info
  async daystat (month, year) {
    const now = new Date()
    month = month || now.getMonth() + 1
    year = year || now.getFullYear()
    const r = await this.send({ 'smartlife.iot.common.schedule': { get_daystat: { month: month, year: year } } })
    return r['smartlife.iot.common.schedule'].get_daystat
  }

  // Get cloud info from bulb
  async cloud () {
    const r = await this.send({ 'smartlife.iot.common.cloud': { get_info: {} } })
    return r['smartlife.iot.common.cloud'].get_info
  }

  // Get schedule from bulb
  async schedule () {
    const r = await this.send({ 'smartlife.iot.common.schedule': { get_rules: {} } })
    return r['smartlife.iot.common.schedule'].get_rules
  }

  // Get operational details from bulb
  details () {
    return this.send({ 'smartlife.iot.smartbulb.lightingservice': { get_light_details: {} } })
  }

  //  Reboot the device
  reboot () {
    return this.send({ 'smartlife.iot.common.system': { reboot: { delay: 1 } } })
  }

  // Badly encrypt message in format bulbs use
  static encrypt (buffer, key = 0xAB) {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      buffer[i] = c ^ key
      key = buffer[i]
    }
    return buffer
  }

  encrypt (buffer, key) {
    return TPLSmartDevice.encrypt(buffer, key)
  }

  // Badly decrypt message from format bulbs use
  static decrypt (buffer, key = 0xAB) {
    for (let i = 0; i < buffer.length; i++) {
      const c = buffer[i]
      buffer[i] = c ^ key
      key = c
    }
    return buffer
  }

  decrypt (buffer, key) {
    return TPLSmartDevice.decrypt(buffer, key)
  }
}
