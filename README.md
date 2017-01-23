<img src="http://s7d1.scene7.com/is/image/officedepot/945143_p_lb120_white_3?$OD-Dynamic$&wid=200&hei=200" align="right" alt="tested with LB120" />

# tplink-lightbulb
Control TP-Link smart lightbulbs from nodejs

[![NPM](https://nodei.co/npm/tplink-lightbulb.png?compact=true)](https://nodei.co/npm/tplink-lightbulb/)

This will allow you to control TP-Link smart lightbulbs from nodejs or the command-line. I have only tested with [LB120](http://www.tp-link.com/us/products/details/cat-5609_LB120.html) bulbs, and am eager to add support for more, so send a PR, or even just a pcap file of network traffic to add support for your lightbulb.

## command-line

You can install it for your system with this:

```
npm i -g tplink-lightbulb
```

Now, you can use it like this:

```
Usage: tplight <COMMAND> <IP_ADDRESS> [options] [<JSON>]

Commands:
  scan     Scan for lightbulbs
  on       Turn on lightbulb
  off      Turn off lightbulb
  cloud    Get cloud info
  raw      Send a raw JSON command
  details  Get details about the device

Options:
  -?, --help        Show help                                          [boolean]
  --timeout         Timeout for scan (in seconds)                   [default: 0]
  --transition, -t  Transition time (for on/off)                    [default: 0]
  --hue, -h         Hue of lightbulb (for on)
  --saturation, -s  Saturation of color (for on)
  --color, -c       Color temperature (for on)
  --brightness, -b  Brightness of light (for on)

Examples:
  tplight scan --timeout=1  Get list of lightbulbs on your network, stop
                                 after 1 second
  tplight on 10.0.0.200     Turn on a light
  tplight off 10.0.0.200    Turn off a light
```

## library

You can install it in your project like this:

```
npm i -S tplink-lightbulb
```

Include it in your project like this:

```js
const Bulb = require('tplink-lightbulb')
```

or for ES6:

```js
import Bulb from 'tplink-lightbulb'
```

## wireshark

If you want to analyze the protocol, you can use the included `tplink-smarthome.lua`.

Install in the location listed in About Wireshark/Folders/Personal Plugins

I captured packets with tcpdump running on a [raspberry pi pretending to be a router](https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point?view=all). In general, this is a really useful way to capture IOT protocols and mess around with them.

I ssh'd into my pi, ran `sudo apt update && sudo apt install tcpdump`, then `tcpdump -i wlan0 -w lights.pcap`

I connected the lights to that network (reset them to factory default by turning the power off/on 5 times, then configure in Kasa app.)

After I did stuff like switch the lights on/off in app, I open the pcap file in wireshark on my desktop.

## API

<dl>
<dt><a href="#module_scan">scan</a> ⇒ <code>EventEmitter</code></dt>
<dd><p>Scan for lightbulbs on your network</p>
</dd>
<dt><a href="#module_info">info</a> ⇒ <code>Promise</code></dt>
<dd><p>Get info about the Bulb</p>
</dd>
<dt><a href="#module_send">send</a> ⇒ <code>Promise</code></dt>
<dd><p>Send a message to a lightbulb (for RAW JS message objects)</p>
</dd>
<dt><a href="#module_set">set</a> ⇒ <code>Promise</code></dt>
<dd><p>Change state of lightbulb</p>
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
**Example**  
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
<a name="module_info"></a>

## info ⇒ <code>Promise</code>
Get info about the Bulb

**Returns**: <code>Promise</code> - Resolves to info
* @example
```js
// turn first discovered light off
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
<a name="module_set"></a>

## set ⇒ <code>Promise</code>
Change state of lightbulb

**Returns**: <code>Promise</code> - Resolves to output of command  

| Param | Type | Description |
| --- | --- | --- |
| power | <code>Boolean</code> | On or off |
| transition | <code>Number</code> | Transition to new state in this time |
| options | <code>Object</code> | Object containing `mode`, `hue`, `saturation`, `color_temp`, `brightness` |

**Example**  
```js
// turn a light on
const light = new Bulb('10.0.0.200')
light.set(true)
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
const encrypted = Bulb.encrypt(Buffer.from('super secret text'))
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
const decrypted = Bulb.decrypt(encrypted)
```

## thanks

Thanks to [hs100-api](https://github.com/plasticrake/hs100-api) to for some good ideas, and [tplink-smartplug](https://github.com/softScheck/tplink-smartplug) for a good start to a wireshark dissector and some good ideas.