// this is a dev-script to create release-bundles of CLI

const pkgOrig = require('pkg')
const archiver = require('archiver-promise')
const { mkdir } = require('fs').promises
const rimraf = require('rimraf').sync

const pkg = async target => {
  console.log(`Building ${target}`)
  await pkgOrig.exec(`../src/cli.js --nodeRange=latest --target latest-${target} --output ${target}/tplight`.split(' '))
  const archive = archiver(`${target}.zip`)
  archive.directory(`${target}`)
  await archive.finalize()
}

const run = async () => {
  rimraf(`${__dirname}/../release`)
  try {
    await mkdir(`${__dirname}/../release`)
  } catch (e) {}
  
  process.chdir(`${__dirname}/../release`)

  for (const target of ["win", "mac", "linux"]) {
    await pkg(`${target}-x64`)
  }
}
run()
