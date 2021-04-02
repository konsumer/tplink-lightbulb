// simple test to scan wifi
// run with node src/test/test_wifi.js

const TPLSmartDevice = require('../lib')

TPLSmartDevice.scan()
  .on('light', async light => {
    const wifi = await light.listwifi()
    console.log(`${light.name} (${light._sysinfo.model}) - ${light.ip} - ${wifi.length} wifi found`)
  })
