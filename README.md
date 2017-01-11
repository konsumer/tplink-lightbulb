# tplink-lightbulb
Control TP-Link smart lightbulbs from nodejs

## cli

You can install it for your system with this:

```
npm i -g tplink-lightbulb
```

Now, you can use it like this:

```
tplight on 10.0.0.200
```

For full documentation, run `tplight` with no parameters.

## library

You can install it in your project like this:

```
npm i -S tplink-lightbulb
```

You can use it, like this:

```js
const Bulb = require('tplink-lightbulb')

// turn a light on
const light = new Bulb('10.0.0.200')
light.set(true)
  .then(status => {
    console.log(status)
  })
  .catch(err => console.error(err))
```

You can also scan for lights on your network

```js
const Bulb = require('tplink-lightbulb')
const lights = new Bulb()

// turn first discovered light off
const scan = lights.scan()
  .on('light', light => {
    light.set(false)
      .then(status => {
        console.log(status)
        scan.stop()
      })
  })
```

## wireshark

If you want to analyze the protocol, you can use the included `tplink-smarthome.lue`.

Install in the location listed in About Wireshark/Folders/Personal Plugins

I captured packets with tcpdump running on a [raspberry pi pretending to be a router](https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point?view=all). In general, this is a really useful way to capture IOT protocols and mess around with them.

I ssh'd into my pie, ran `sudo aptupdate && sudo apt install tcpdump`, then `tcpdump -i wlan0 -w lights.pcap`

I connected the lights to that network (reset them to factory default by turning the power off/on 5 times, then configure in Kasa app.)

After I did stuff like switch the lights on/off in app, I open the pcap file in wireshark on my desktop.

## thanks

Thanks to [hs100-api](https://github.com/plasticrake/hs100-api) to for some good ideas, and [tplink-smartplug](https://github.com/softScheck/tplink-smartplug) for a good start to a wireshark dissector and some good ideas.