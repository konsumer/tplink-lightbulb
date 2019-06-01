const pkgOrig = require('pkg')
const archiver = require('archiver-promise')
const { mkdirSync } = require('fs')
const rimraf = require('rimraf').sync

const pkg = async target => {
  console.log(`Building ${target}`)
  await pkgOrig.exec(`../build/cli.js --target latest-${target} --output ${target}/tplight`.split(' '))
  const archive = archiver(`${target}.zip`)
  archive.directory(`${target}`)
  await archive.finalize()
}

const run = async () => {
  rimraf(`${__dirname}/release`)
  try {
    mkdirSync(`${__dirname}/release`)
  } catch (e) {}
  process.chdir(`${__dirname}/release`)

  // for some reason a Promise.all & [].reduce to serialize them kept hanging here, will investigate later

  let target
  target = 'win-x64'
  await pkg(target)

  target = 'linux-x64'
  await pkg(target)

  target = 'macos-x64'
  await pkg(target)
}
run()
