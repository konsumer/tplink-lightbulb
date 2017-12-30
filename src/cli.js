#!/usr/bin/env node

import TPLSmartDevice from './lib'
import yargs from 'yargs'
import { hexToHsl } from 'colorsys'
import jc from 'json-colorizer'

const json = process.stdout.isTTY ? s => console.log(jc(JSON.stringify(s, null, 2))) : s => console.log(JSON.stringify(s, null, 2))

export const arg = yargs
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
    bulb.power(true, argv.transition, {brightness: argv.brightness})
      .then(r => argv.quiet || json(r))
      .catch(console.error)
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
      .catch(console.error)
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

      .example('$0 temp 10.0.0.200 1', 'Set color-temp to orangish')
      .example('$0 temp 10.0.0.200 10000', 'Set color-temp to bluish')
  }, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, argv.transition, {hue: 0, saturation: 0, color_temp: argv.color})
      .then(r => argv.quiet || json(r))
      .catch(console.error)
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
    bulb.power(true, argv.transition, {hue: color.h, saturation: color.s, brightness: color.l, color_temp: 0})
      .then(r => argv.quiet || json(r))
      .catch(console.error)
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
    const {transition, hue, saturation, brightness} = argv
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.power(true, transition, {color_temp: 0, hue, saturation, brightness})
      .then(r => argv.quiet || json(r))
      .catch(console.error)
  })

  .command('cloud <ip>', 'Get cloud info', {}, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.cloud()
      .then(r => json(r))
      .catch(console.error)
  })

  .command('raw <ip> <json>', 'Send a raw JSON command', {}, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    bulb.send(JSON.parse(argv.json))
      .then(r => argv.quiet || json(r))
      .catch(console.error)
  })

  .command('details <ip>', 'Get details about the device', {}, argv => {
    const bulb = new TPLSmartDevice(argv.ip)
    Promise.all([
      bulb.details(),
      bulb.info()
    ])
    .then(([info, details]) => {
      json({...details, ...info})
    })
    .catch(console.error)
  })

  .argv
