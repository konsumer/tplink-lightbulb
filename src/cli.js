#!/usr/bin/env node

import Bulb from './lib'
import yargs from 'yargs'

var argv = yargs
  .usage('Usage: $0 <COMMAND> <IP_ADDRESS> [options] [<JSON>]')
  .help('?')
  .alias('?', 'help')

  .command('scan', 'Scan for lightbulbs')
  .command('on', 'Turn on lightbulb')
  .command('off', 'Turn off lightbulb')
  .command('cloud', 'Get cloud info')
  .command('raw', 'Send a raw JSON command')
  .command('details', 'Get details about the device')

  .example('$0 scan --timeout=1', 'Get list of lightbulbs on your network, stop after 1 second')
  .example('$0 on 10.0.0.200', 'Turn on a light')
  .example('$0 off 10.0.0.200', 'Turn off a light')

  .alias('transition', 't')
  .nargs('transition', 1)
  .default('transition', 0)
  .describe('t', 'Transition time (for on/off)')

  .alias('hue', 'h')
  .nargs('hue', 1)
  .describe('h', 'Hue of lightbulb (for on)')

  .alias('saturation', 's')
  .nargs('saturation', 1)
  .describe('s', 'Saturation of color (for on)')

  .alias('color', 'c')
  .nargs('color', 1)
  .describe('c', 'Color temperature (for on)')

  .alias('brightness', 'b')
  .nargs('brightness', 1)
  .describe('b', 'Brightness of light (for on)')

  .nargs('timeout', 1)
  .describe('timeout', 'Timeout for scan (in seconds)')
  .default('timeout', 0)

  .argv

const command = argv._.shift()

if ((!argv._.length || argv._.length < 1) && command !== 'scan') {
  console.log('COMMAND and IP_ADDRESS are required')
  yargs.showHelp()
  process.exit(1)
}

const ip = argv._.shift()
const json = argv._.shift()

switch (command) {
  case 'raw':
    if (!json) {
      console.log('JSON and IP_ADDRESS is required for raw command')
      yargs.showHelp()
      process.exit(1)
    }
    (new Bulb(ip)).send(JSON.parse(json))
      .then(r => console.log(r))
    break
  case 'details':
    (new Bulb(ip)).details()
      .then(r => console.log(r))
    break
  case 'cloud':
    (new Bulb(ip)).cloud()
      .then(r => console.log(r))
    break
  case 'on':
  case 'off':
    const options = {}
    if (argv.hue !== undefined) {
      options.hue = argv.hue
    }
    if (argv.saturation !== undefined) {
      options.saturation = argv.saturation
    }
    if (argv.color !== undefined) {
      options.color_temp = argv.color
    }
    if (argv.brightness !== undefined) {
      options.brightness = argv.brightness
    }
    (new Bulb(ip)).set(command === 'on', argv.transition, options)
      .then(r => console.log(r))
    break
  case 'scan':
    const lights = new Bulb()
    if (argv.timeout) {
      setTimeout(() => {
        scan.stop()
      }, argv.timeout * 1000)
    } else {
      console.log('Press Ctrl-C to stop')
    }
    const scan = Bulb.scan()
      .on('light', light => {
        console.log(light.info.address, '-', light.info.alias)
      })
    break
  default:
    console.log('Unknown command.')
    yargs.showHelp()
    process.exit(1)
}
