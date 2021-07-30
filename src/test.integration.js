// this requires real hardware

import TPLSmartDevice from './index.js'

// get a number of real devices to test
async function getNLights (n = 3, timeout=3000) {
  return new Promise((resolve, reject) => {
    const scan = TPLSmartDevice.scan()
    const testLights = []
    const t = setTimeout(() => {
      if (testLights.length < n) {
        reject(new Error('Timeout without getting required number of devices'))
      }
    }, timeout)
    scan.on('light', light => {
      testLights.push(light)
      if (testLights.length >= n) {
        clearTimeout(t)
        scan.stop()
        resolve(testLights)
      }
    })
  })
}

const lights = await getNLights()
console.log(lights)