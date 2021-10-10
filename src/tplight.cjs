#!/usr/bin/env node

const TPLSmartDevice = require('../dist/tplink-lightbulb.cjs')
const yargs = require('yargs')

// https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf
function hexToHsl (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b); const min = Math.min(r, g, b)
  let h; let s; const l = (max + min) / 2
  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h, s, l }
}

async function readStream (stream = process.stdin) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
  })
}

// wrapper that will output JSON or colored depending on how it's being piped
const json = process.stdout.isTTY ? s => console.dir(s, { depth: null, colors: true, maxArrayLength: null, maxStringLength: null }) : s => console.log(JSON.stringify(s, null, 2))

// for pkg support
if (typeof process.pkg !== 'undefined') {
  process.pkg.defaultEntrypoint = 'tplight'
}

function handleError (err) {
  console.error(err)
  process.exit(1)
}

module.exports = yargs
  .usage('Usage: $0 <COMMAND>')
  .help('h')
  .alias('h', 'help')
  .demandCommand(1, 1, 'You need a command.')
  .version()

  .example('$0 scan -h', 'Get more detailed help with `scan` command')
  .example('$0 on -h', 'Get more detailed help with `on` command')
  .example('$0 off -h', 'Get more detailed help with `off` command')
  .example('$0 temp -h', 'Get more detailed help with `temp` command')
  .example('$0 hex -h', 'Get more detailed help with `hex` command')
  .example('$0 hsb -h', 'Get more detailed help with `hsb` command')
  .example('$0 cloud -h', 'Get more detailed help with `cloud` command')
  .example('$0 raw -h', 'Get more detailed help with `raw` command')
  .example('$0 details -h', 'Get more detailed help with `details` command')
  .example('$0 led -h', 'Get more detailed help with `led` command')
  .example('$0 wifi -h', 'Get more detailed help with `wifi` command')
  .example('$0 join -h', 'Get more detailed help with `join` command')

  .command('scan', 'Scan for lightbulbs', yarg => {
    yarg
      .alias('timeout', 't')
      .nargs('timeout', 1)
      .describe('timeout', 'Timeout for scan (in seconds)')
      .default('timeout', 0)

      .alias('filter', 'f')
      .nargs('filter', 1)
      .describe('filter', 'filter to a specific class of devices (ie: IOT.SMARTBULB)')

      .alias('broadcast', 'b')
      .nargs('broadcast', 1)
      .describe('broadcast', 'The network broadcast address for scanning')
      .default('broadcast', '255.255.255.255')

      .example('$0 scan -t 1', 'Get list of TP-Link smart devices on your network, stop after 1 second')
  }, argv => {
    const scan = TPLSmartDevice.scan(argv.filter, argv.broadcast)
      .on('light', light => {
        console.log(`${light._info.address} - ${light._sysinfo.alias} - ${light._sysinfo.model}`)
      })
    if (argv.timeout) {
      setTimeout(() => { scan.stop() }, argv.timeout * 1000)
    } else {
      console.log('Press Ctrl-C to stop')
    }
  })

  .command('on <ip>', 'Turn on lightbulb', yarg => {
    yarg
      .boolean('quiet')
      .describe('quiet', "Don't output return value of command")
      .alias('quiet', 'q')

      .alias('transition', 't')
      .nargs('transition', 1)
      .default('transition', 0)
      .describe('t', 'Transition time (in ms)')

      .alias('brightness', 'b')
      .nargs('brightness', 1)
      .default('brightness', 100)
      .describe('b', 'Brightness')

      .example('$0 on 10.0.0.200', 'Turn on a light')
      .example('$0 on -t 10000 10.0.0.200', 'Take 10 seconds to turn on a light')
  }, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, argv.transition, { brightness: argv.brightness })
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('off <ip>', 'Turn off lightbulb', yarg => {
    yarg
      .boolean('quiet')
      .describe('quiet', "Don't output return value of command")
      .alias('quiet', 'q')

      .alias('transition', 't')
      .nargs('transition', 1)
      .default('transition', 0)
      .describe('t', 'Transition time (in ms)')

      .example('$0 off 10.0.0.200', 'Turn off a light')
      .example('$0 off -t 10000 10.0.0.200', 'Take 10 seconds to turn off a light')
  }, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(false, argv.transition)
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('bright <ip> <brightness>', 'Set the brightness of the lightbulb (for those that support it)', yarg => {
    yarg
      .boolean('quiet')
      .describe('quiet', "Don't output return value of command")
      .alias('quiet', 'q')

      .alias('transition', 't')
      .nargs('transition', 1)
      .default('transition', 0)
      .describe('t', 'Transition time (in ms)')

      .example('$0 bright 10.0.0.200 1', 'Set brightness to very low')
      .example('$0 bright 10.0.0.200 100', 'Set brightness to max')
  }, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, argv.transition, { brightness: argv.brightness })
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('temp <ip> <color>', 'Set the color-temperature of the lightbulb (for those that support it)', yarg => {
    yarg
      .boolean('quiet')
      .describe('quiet', "Don't output return value of command")
      .alias('quiet', 'q')

      .alias('transition', 't')
      .nargs('transition', 1)
      .default('transition', 0)
      .describe('t', 'Transition time (in ms)')

      .example('$0 temp 10.0.0.200 2500', 'Set color-temp to orangish')
      .example('$0 temp 10.0.0.200 9000', 'Set color-temp to bluish')
  }, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, argv.transition, { hue: 0, saturation: 0, color_temp: argv.color })
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('hex <ip> <color>', 'Set color of lightbulb using hex color (for those that support it)', yarg => {
    yarg
      .boolean('quiet')
      .describe('quiet', "Don't output return value of command")
      .alias('quiet', 'q')

      .alias('transition', 't')
      .nargs('transition', 1)
      .default('transition', 0)
      .describe('t', 'Transition time (in ms)')

      .example('$0 hex 10.0.0.200 "#48258b"', 'Set the lightbulb to a nice shade of purple.')
      .example('$0 hex -t 10000 10.0.0.200 "#48258b"', 'Take 10 seconds to set the lightbulb to a nice shade of purple.')
  }, argv => {
    const color = hexToHsl(argv.color)
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, argv.transition, { hue: color.h * 100, saturation: color.s * 100, brightness: color.l * 100, color_temp: 0 })
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('hsb <ip> <hue> <saturation> <brightness>', 'Set color of lightbulb using HSB color (for those that support it)', yarg => {
    yarg
      .boolean('quiet')
      .describe('quiet', "Don't output return value of command")
      .alias('quiet', 'q')

      .alias('transition', 't')
      .nargs('transition', 1)
      .default('transition', 0)
      .describe('t', 'Transition time (in ms)')

      .example('$0 hsb 10.0.0.200 72 58 35', 'Set the lightbulb to a nice shade of purple.')
      .example('$0 hsb -t 10000 10.0.0.200 72 58 35', 'Take 10 seconds to set the lightbulb to a nice shade of purple.')
  }, argv => {
    const { transition, hue, saturation, brightness } = argv
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, transition, { color_temp: 0, hue, saturation, brightness })
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('cloud <ip>', 'Get cloud info', {}, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.cloud()
      .then(r => json(r))
      .catch(handleError)
  })

  .command('raw <ip> [json]', 'Send a raw JSON command, use param or stdin', {}, async argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    process.stdin.resume()
    const msg = argv.json ? argv.json : await readStream()
    if (!msg) {
      console.error('For raw, you must provide JSON via param or stdin.')
      process.exit(1)
    }
    bulb.send(JSON.parse(msg))
      .then(r => argv.quiet || json(r))
      .catch(handleError)
  })

  .command('details <ip>', 'Get details about the device', {}, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    Promise.all([
      bulb.details(),
      bulb.info()
    ])
      .then(([details, info]) => {
        json({ ...details, ...info })
      })
      .catch(handleError)
  })

  .command('led <ip> <ledState>', 'Turn on/off LED indicator', yarg => {
    yarg
      .example('$0 led 10.0.0.200 off', 'Turn off the LED')
      .example('$0 led 10.0.0.200 on', 'Turn on the LED')
  }, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    const ledState = ['y', 'yes', 'true', '1', 'on'].indexOf(argv.ledState.toLowerCase()) === -1
    bulb.led(ledState)
  })

  .command('wifi <ip>', 'List available wifi for a particular device', yarg => {
    yarg
      .example('$0 wifi 10.0.0.200', 'List wifi')
  }, async argv => {
    try {
      const bulb = new TPLSmartDevice(argv.ip)
      const wifi = await bulb.listwifi()
      json(wifi)
    } catch (e) {
      handleError(e)
    }
  })

  .command('join <ip> <SSID> [SECRET]', 'Configure the device to use these wifi settings', yarg => {
    yarg
      .example('$0 join 10.0.0.200 "my SSID goes here" "my password goes here"', 'Setup wifi')
  }, async argv => {
    try {
      const bulb = new TPLSmartDevice(argv.ip)
      const wifi = await bulb.listwifi()
      const chosen = wifi.find(w => w.ssid === argv.SSID)
      if (!chosen) {
        handleError(`${argv.SSID} not found.`)
      }
      // sometimes data is missing cypher_type, so I guess based on key_type
      const status = await bulb.connectwifi(argv.SSID, argv.SECRET, chosen.key_type, chosen.key_type === 3 ? 2 : 0)

      if (status) {
        console.log(`OK, joined ${argv.SSID}.`)
      } else {
        console.log(`Could not join ${argv.SSID}.`)
      }
    } catch (e) {
      handleError(e)
    }
  })

  .argv
