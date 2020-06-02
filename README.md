<img src="https://officedepot.scene7.com/is/image/officedepot/945143_p_lb120_pkg?$OD%2DLarge$&wid=450&hei=450" align="right" alt="tested with LB120" />

# tplink-lightbulb

Control TP-Link smart-home devices from nodejs

[![NPM](https://badge.fury.io/js/tplink-lightbulb.svg)](https://nodei.co/npm/tplink-lightbulb/)

This will allow you to control TP-Link smart-home devices from nodejs or the command-line.

## related

* If you want to use kasa (allows you to hit your tplink devices, on an external network) have a look at [kasa_control](https://github.com/konsumer/kasa_control).
* If you'd like to run a GraphQL server to control your lights, see [tplink-graphql](https://github.com/konsumer/tplink-graphql).
* If you like to see a demo web-app that uses react & websockets, see [tpserver](https://github.com/konsumer/tpserver).

## supported devices

Not all TP-Link smart-home devices can do all things, here's the support-matrix:

|                                                                         | raw | details | on | off | temp | hex | hsb | cloud |
|------------------------------------------------------------------------:|:---:|:-------:|:--:|:---:|:----:|:---:|:---:|:-----:|
| [LB100](http://www.tp-link.com/us/products/details/cat-5609_LB100.html) |  X  |    X    |  X |  X  |   X  |     |     |   X   |
| [LB120](http://www.tp-link.com/us/products/details/cat-5609_LB120.html) |  X  |    X    |  X |  X  |   X  |     |     |   X   |
| [LB130](http://www.tp-link.com/us/products/details/cat-5609_LB130.html) |  X  |    X    |  X |  X  |   X  |  X  |  X  |   X   |
| [HS100](http://www.tp-link.com/us/products/details/cat-5516_HS100.html) |  X  |    X    |  X |  X  |      |     |     |       |
| [HS105](http://www.tp-link.com/us/products/details/cat-5516_HS105.html) |  X  |    X    |  X |  X  |      |     |     |       |
| [HS110](http://www.tp-link.com/us/products/details/cat-5516_HS110.html) |  X  |    X    |  X |  X  |      |     |     |       |
| [HS200](http://www.tp-link.com/us/products/details/cat-5622_HS200.html) |  X  |    X    |  X |  X  |      |     |     |       |
| [KP100](http://www.tp-link.com/us/products/details/cat-5516_KP100.html) |  X  |    X    |  X |  X  |      |     |     |       |
| [LB200](http://www.tp-link.com/us/products/details/cat-5609_LB200.html) |  X  |    X    |  X |  X  |   X  |     |     |   X   |
| [LB230](http://www.tp-link.com/us/products/details/cat-5609_LB230.html) |  X  |    X    |  X |  X  |   X  |  X  |  X  |   X   |
| [KL110](https://www.tp-link.com/uk/home-networking/smart-bulb/kl110/)   |  X  |    X    |  X |  X  |      |     |     |

I have LB120, LB130, and HS105, so any testing (and packet-capture) with other devices would be greatly appreciated. 


## command-line

If you have nodejs installed, you can install it for your system with this:

```
npm i -g tplink-lightbulb
```

If you don't want to install nodejs, or just want the standalone-version, install a [release](https://github.com/konsumer/tplink-lightbulb/releases) for your system.

Now, you can use it like this:

```
Usage: tplight <COMMAND>

Commands:
  scan                                      Scan for lightbulbs
  on <ip>                                   Turn on lightbulb
  off <ip>                                  Turn off lightbulb
  temp <ip> <color>                         Set the color-temperature of the
                                            lightbulb (for those that support
                                            it)
  hex <ip> <color>                          Set color of lightbulb using hex
                                            color (for those that support it)
  hsb <ip> <hue> <saturation> <brightness>  Set color of lightbulb using HSB
                                            color (for those that support it)
  cloud <ip>                                Get cloud info
  raw <ip> <json>                           Send a raw JSON command
  details <ip>                              Get details about the device

Options:
  -h, --help  Show help                                                [boolean]

Examples:
  tplight scan -h     Get more detailed help with `scan` command
  tplight on -h       Get more detailed help with `on` command
  tplight off -h      Get more detailed help with `off` command
  tplight temp -h     Get more detailed help with `temp` command
  tplight hex -h      Get more detailed help with `hex` command
  tplight hsb -h      Get more detailed help with `hsb` command
  tplight cloud -h    Get more detailed help with `cloud` command
  tplight raw -h      Get more detailed help with `raw` command
  tplight details -h  Get more detailed help with `details` command
```

## wireshark

If you want to analyze the protocol, you can use the included `tplink-smarthome.lua`.

Install in the location listed in About Wireshark/Folders/Personal Plugins

I captured packets with tcpdump running on a [raspberry pi pretending to be a router](https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point?view=all). In general, this is a really useful way to capture IOT protocols and mess around with them.

I ssh'd into my pi, ran `sudo apt update && sudo apt install tcpdump`, then `tcpdump -i wlan0 -w lights.pcap`

I connected the lights to that network (reset them to factory default by turning the power off/on 5 times, then configure in Kasa app.)

After I did stuff like switch the lights on/off in app, I open the pcap file in wireshark on my desktop.

## library

You can install it in your project like this:

```
npm i -S tplink-lightbulb
```

Include it in your project like this:

```js
const TPLSmartDevice = require('tplink-lightbulb')
```

or for ES6:

```js
import TPLSmartDevice from 'tplink-lightbulb'
```

## API

<dl>
<dt><a href="#module_scan">scan</a> ⇒ <code>EventEmitter</code></dt>
<dd><p>Scan for lightbulbs on your network</p>
</dd>
<dt><a href="#module_info">info</a> ⇒ <code>Promise</code></dt>
<dd><p>Get info about the TPLSmartDevice</p>
</dd>
<dt><a href="#module_send">send</a> ⇒ <code>Promise</code></dt>
<dd><p>Send a message to a lightbulb (for RAW JS message objects)</p>
</dd>
<dt><a href="#module_power">power</a> ⇒ <code>Promise</code></dt>
<dd><p>Set power-state of lightbulb</p>
</dd>
<dt><a href="#module_daystat">daystat</a> ⇒ <code>Promise</code></dt>
<dd><p>Get schedule info</p>
</dd>
<dt><a href="#module_cloud">cloud</a> ⇒ <code>Promise</code></dt>
<dd><p>Get cloud info from bulb</p>
</dd>
<dt><a href="#module_schedule">schedule</a> ⇒ <code>Promise</code></dt>
<dd><p>Get schedule from bulb</p>
</dd>
<dt><a href="#module_details">details</a> ⇒ <code>Promise</code></dt>
<dd><p>Get operational details from bulb</p>
</dd>
<dt><a href="#module_encrypt">encrypt</a> ⇒ <code>Buffer</code></dt>
<dd><p>Badly encrypt message in format bulbs use</p>
</dd>
<dt><a href="#module_decrypt">decrypt</a> ⇒ <code>Buffer</code></dt>
<dd><p>Badly decrypt message from format bulbs use</p>
</dd>
</dl>

<a name="module_scan"></a>

## scan ⇒ <code>EventEmitter</code>
Scan for lightbulbs on your network

**Returns**: <code>EventEmitter</code> - Emit `light` events when lightbulbs are found  

| Param | Type | Description |
| --- | --- | --- |
| filter | <code>string</code> | [none] Only return devices with this class, (ie 'IOT.SMARTBULB') |
| broadcast | <code>string</code> | ['255.255.255.255'] Use this broadcast IP |

**Example**  
```js
// turn first discovered light off
const scan = TPLSmartDevice.scan()
  .on('light', light => {
    light.power(false)
      .then(status => {
        console.log(status)
        scan.stop()
      })
  })
```
<a name="module_info"></a>

## info ⇒ <code>Promise</code>
Get info about the TPLSmartDevice

**Returns**: <code>Promise</code> - Resolves to info  
**Example**  
```js
// get info about a light
const light = new TPLSmartDevice('10.0.0.200')
light.info()
  .then(info => {
    console.log(info)
  })
```
<a name="module_send"></a>

## send ⇒ <code>Promise</code>
Send a message to a lightbulb (for RAW JS message objects)

**Returns**: <code>Promise</code> - Resolves with answer  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>Object</code> | Message to send to bulb |

**Example**  
```js
const light = new TPLSmartDevice('10.0.0.200')
light.send({
  'smartlife.iot.smartbulb.lightingservice': {
    'transition_light_state': {
      'on_off': 1,
      'transition_period': 0
    }
}})
.then(response => {
  console.log(response)
})
.catch(e => console.error(e))
```
<a name="module_power"></a>

## power ⇒ <code>Promise</code>
Set power-state of lightbulb

**Returns**: <code>Promise</code> - Resolves to output of command  

| Param | Type | Description |
| --- | --- | --- |
| powerState | <code>Boolean</code> | On or off |
| transition | <code>Number</code> | Transition to new state in this time |
| options | <code>Object</code> | Object containing `mode`, `hue`, `saturation`, `color_temp`, `brightness` |

**Example**  
```js
// turn a light on
const light = new TPLSmartDevice('10.0.0.200')
light.power(true)
  .then(status => {
    console.log(status)
  })
  .catch(err => console.error(err))
```
<a name="module_daystat"></a>

## daystat ⇒ <code>Promise</code>
Get schedule info

**Returns**: <code>Promise</code> - Resolves to schedule info  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>Number</code> | Month to check: 1-12 |
| year | <code>Number</code> | Full year to check: ie 2017 |

**Example**  
```js
// get the light's schedule for 1/2017
const light = new TPLSmartDevice('10.0.0.200')
light.schedule(1, 2017)
  .then(schedule => {
    console.log(schedule)
  })
  .catch(e => console.error(e))
```
<a name="module_cloud"></a>

## cloud ⇒ <code>Promise</code>
Get cloud info from bulb

**Returns**: <code>Promise</code> - Resolves to cloud info  
**Example**  
```js
// get the cloud info for the light
const light = new TPLSmartDevice('10.0.0.200')
light.cloud()
  .then(info => {
    console.log(info)
  })
  .catch(e => console.error(e))
```
<a name="module_schedule"></a>

## schedule ⇒ <code>Promise</code>
Get schedule from bulb

**Returns**: <code>Promise</code> - Resolves to schedule info  
**Example**  
```js
// get the bulb's schedule
const light = new TPLSmartDevice('10.0.0.200')
light.schedule()
  .then(schedule => {
    console.log(schedule)
  })
  .catch(e => console.error(e))
```
<a name="module_details"></a>

## details ⇒ <code>Promise</code>
Get operational details from bulb

**Returns**: <code>Promise</code> - Resolves to operational details  
**Example**  
```js
// get some extra details about the light
const light = new TPLSmartDevice('10.0.0.200')
light.details()
  .then(details => {
    console.log(details)
  })
  .catch(e => console.error(e))
```
<a name="module_encrypt"></a>

## encrypt ⇒ <code>Buffer</code>
Badly encrypt message in format bulbs use

**Returns**: <code>Buffer</code> - Encrypted data  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>Buffer</code> | Buffer of data to encrypt |
| key | <code>Number</code> | Encryption key (default is generally correct) |

**Example**  
```js
const encrypted = TPLSmartDevice.encrypt(Buffer.from('super secret text'))
```
<a name="module_decrypt"></a>

## decrypt ⇒ <code>Buffer</code>
Badly decrypt message from format bulbs use

**Returns**: <code>Buffer</code> - Decrypted data  

| Param | Type | Description |
| --- | --- | --- |
| buffer | <code>Buffer</code> | Buffer of data to decrypt |
| key | <code>Number</code> | Encryption key (default is generally correct) |

**Example**  
```js
const decrypted = TPLSmartDevice.decrypt(encrypted)
```


## development

I use [standard](https://standardjs.com/). You can auto-format your code with `standard --fix` and there's plugins for lots of editors.

## sound

Kyle Dixon made [a cool beat-match script](https://github.com/konsumer/tplink-lightbulb/wiki/Beatmatch) for syncing lights to music.

## thanks

Thanks to [hs100-api](https://github.com/plasticrake/hs100-api) to for some good ideas, and [tplink-smartplug](https://github.com/softScheck/tplink-smartplug) for a good start to a wireshark dissector and some good ideas. @DaveGut really helped with bulb-hacking and research on LB130's.
