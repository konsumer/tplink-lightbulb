# [tplink-lightbulb](https://github.com/konsumer/tplink-lightbulb#readme) *1.6.3*

> Control TP-Link smart-home devices from nodejs


### src/lib.js


#### scan(filter, broadcast) 

Scan for lightbulbs on your network




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| filter | `string`  | [none] Only return devices with this class, (ie 'IOT.SMARTBULB') | &nbsp; |
| broadcast | `string`  | ['255.255.255.255'] Use this broadcast IP | &nbsp; |




##### Examples

```javascript
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


##### Returns


- `EventEmitter`  Emit `light` events when lightbulbs are found



#### listwifi() 

Scans the wifi networks in range of the device






##### Examples

```javascript
// scan for available wifi
const light = new TPLSmartDevice('10.0.0.200')
light.listwifi()
  .then(info => {
    console.log(info)
  })
```


##### Returns


- `Promise`  Resolves to output of command



#### connectwifi(ssid, password, keyType, cypherType) 

Connects the device to the access point in the parameters




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| ssid |  | {String} Your wifi SSID | &nbsp; |
| password |  | {String} Your wifi secret | &nbsp; |
| keyType |  | {Number} The type of key (WPA 2 is 3, no key is 0) | &nbsp; |
| cypherType |  | {Number} The type of cypher (WPA2 is 2) | &nbsp; |




##### Examples

```javascript
// command a device to join a wifi network
const light = new TPLSmartDevice('10.0.0.200')
light.connectwifi("SSID", "PASSWORD", 3, 2)
  .then(info => {
    console.log(info)
  })
```


##### Returns


- `Promise`  Resolves to output of command



#### info() 

Get info about the TPLSmartDevice






##### Examples

```javascript
// get info about a light
const light = new TPLSmartDevice('10.0.0.200')
light.info()
  .then(info => {
    console.log(info)
  })
```


##### Returns


- `Promise`  Resolves to info



#### send(msg) 

Send a message to a lightbulb (for RAW JS message objects)




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| msg | `Object`  | Message to send to bulb | &nbsp; |




##### Examples

```javascript
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


##### Returns


- `Promise`  Resolves with answer



#### power(powerState, transition, options) 

Set power-state of lightbulb




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| powerState | `Boolean`  | On or off | &nbsp; |
| transition | `Number`  | Transition to new state in this time | &nbsp; |
| options | `Object`  | Object containing `mode`, `hue`, `saturation`, `color_temp`, `brightness` | &nbsp; |




##### Examples

```javascript
// turn a light on
const light = new TPLSmartDevice('10.0.0.200')
light.power(true)
  .then(status => {
    console.log(status)
  })
  .catch(err => console.error(err))
```


##### Returns


- `Promise`  Resolves to output of command



#### led(ledState) 

Set led-state of lightbulb




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| ledState | `Boolean`  | On or off | &nbsp; |




##### Examples

```javascript
// turn the LED status light on
const light = new TPLSmartDevice('10.0.0.200')
light.led(true)
.then(status => {
  console.log(status)
})
.catch(err => console.error(err))
```


##### Returns


- `Promise`  Resolves to output of command



#### name(newAlias) 

Set the name of lightbulb




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| newAlias | `String`  |  | &nbsp; |




##### Examples

```javascript
// change the name of a light
const light = new TPLSmartDevice('10.0.0.200')
light.name("New Name")
.then(status => {
console.log(status)
})
.catch(err => console.error(err))
```


##### Returns


- `Promise`  Resolves to output of command



#### daystat(month, year) 

Get schedule info




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| month | `Number`  | Month to check: 1-12 | &nbsp; |
| year | `Number`  | Full year to check: ie 2017 | &nbsp; |




##### Examples

```javascript
// get the light's schedule for 1/2017
const light = new TPLSmartDevice('10.0.0.200')
light.schedule(1, 2017)
  .then(schedule => {
    console.log(schedule)
  })
  .catch(e => console.error(e))
```


##### Returns


- `Promise`  Resolves to schedule info



#### cloud() 

Get cloud info from bulb






##### Examples

```javascript
// get the cloud info for the light
const light = new TPLSmartDevice('10.0.0.200')
light.cloud()
  .then(info => {
    console.log(info)
  })
  .catch(e => console.error(e))
```


##### Returns


- `Promise`  Resolves to cloud info



#### schedule() 

Get schedule from bulb






##### Examples

```javascript
// get the bulb's schedule
const light = new TPLSmartDevice('10.0.0.200')
light.schedule()
  .then(schedule => {
    console.log(schedule)
  })
  .catch(e => console.error(e))
```


##### Returns


- `Promise`  Resolves to schedule info



#### details() 

Get operational details from bulb






##### Examples

```javascript
// get some extra details about the light
const light = new TPLSmartDevice('10.0.0.200')
light.details()
  .then(details => {
    console.log(details)
  })
  .catch(e => console.error(e))
```


##### Returns


- `Promise`  Resolves to operational details



#### reboot() 

Reboot the device






##### Examples

```javascript
// get some extra details about the light
const light = new TPLSmartDevice('10.0.0.200')
light.reboot()
  .then(status => {
    console.log(status)
  })
  .catch(e => console.error(e))
```


##### Returns


- `Promise`  Resolves to output of command



#### encrypt(buffer, key) 

Badly encrypt message in format bulbs use




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| buffer | `Buffer`  | Buffer of data to encrypt | &nbsp; |
| key | `Number`  | Encryption key (default is generally correct) | &nbsp; |




##### Examples

```javascript
const encrypted = TPLSmartDevice.encrypt(Buffer.from('super secret text'))
```


##### Returns


- `Buffer`  Encrypted data



#### decrypt(buffer, key) 

Badly decrypt message from format bulbs use




##### Parameters

| Name | Type | Description |  |
| ---- | ---- | ----------- | -------- |
| buffer | `Buffer`  | Buffer of data to decrypt | &nbsp; |
| key | `Number`  | Encryption key (default is generally correct) | &nbsp; |




##### Examples

```javascript
const decrypted = TPLSmartDevice.decrypt(encrypted)
```


##### Returns


- `Buffer`  Decrypted data




*Documentation generated with [doxdox](https://github.com/neogeek/doxdox).*
