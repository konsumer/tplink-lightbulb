# tplink-lightbulb
Control TP-Link smart lightbulbs from nodejs

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

// turn all discovered lights off
lights.scan()
  .on('light', light => {
    light.set(false)
      .then(status => {
        console.log(status)
      })
  })
```

# thanks

Thanks to [hs100-api](https://github.com/plasticrake/hs100-api) to for some good ideas, and [tplink-smartplug](https://github.com/softScheck/tplink-smartplug) for a good start to a wireshark dissector and some good ideas.