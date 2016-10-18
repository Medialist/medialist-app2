const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const replaceStream = require('replacestream')
const async = require('async')
const dir = path.join(__dirname, '..', 'svgs', 'icons')

async.waterfall([
  slugify,
  readSvgDir,
  replaceText,
  createComponents,
  createIndex
], function (err) {
  if (err) throw err
})

function slugify (next) {
  exec('cd @ && for f in *; do mv "$f" "$f.tmp"; mv "$f.tmp" "`echo $f | tr "[:upper:]" "[:lower:]" | tr " " "-"`"; done'.replace('@', dir), {}, next)
}

function readSvgDir (stdout, stderr, next) {
  fs.readdir(dir, function (err, icons) {
    if (err && err.code !== 'ENOENT') throw err
    next(null, icons)
  })
}

function replaceText (icons, next) {
  async.each(icons, function (icon, finish) {
    const readPath = path.join(dir, icon)
    const writePath = path.join(__dirname, '..', '..', 'imports', 'ui', 'components', 'icons', icon)

    const output = fs.createWriteStream(writePath)
    output.on('finish', finish)

    fs.createReadStream(readPath)
      .pipe(replaceStream('fill-rule', 'fillRule'))
      .pipe(replaceStream('"', "'"))
      .pipe(output)
  }, (err) => next(err, icons))
}

function createComponents (icons, next) {
  async.each(icons, function (icon, finish) {
    const readPath = path.join(__dirname, '..', '..', 'imports', 'ui', 'components', 'icons', icon)
    const writePath = path.join(__dirname, '..', '..', 'imports', 'ui', 'components', 'icons', icon.replace('.svg', '.jsx'))

    fs.readFile(readPath, (err, svg) => {
      if (err) throw err
      const component = wrap(icon, svg)
      fs.unlink(readPath)
      fs.writeFile(writePath, component, finish)
    })
  }, (err) => next(err, icons))
}

function wrap (icon, svg) {
  const ComponentName = svgFilenameToReactComponentName(icon)
  return `import React from 'react'\nfunction ${ComponentName} () {\nreturn (${svg})\n}\nexport default ${ComponentName}\n`
}

function createIndex (icons, next) {
  const writePath = path.join(__dirname, '..', '..', 'imports', 'ui', 'components', 'icons.js')

  const index = [icons.reduce((imp, icon) => {
    imp += `import ${svgFilenameToReactComponentName(icon)} from './icons/${icon.replace('.svg', '.jsx')}'\n`
    return imp
  }, ''),
  icons.reduce((exp, icon, i) => {
    exp += '  '
    exp += svgFilenameToReactComponentName(icon)
    if (i !== icons.length - 1) exp += ',\n'
    if (i === icons.length - 1) exp += '\n}\n'
    return exp
  }, 'exports = {\n')].join('')

  fs.writeFile(writePath, index, next)
}

function svgFilenameToReactComponentName (slug) {
  return slug
    .split('-')
    .map((iconName) => iconName.charAt(0).toUpperCase() + iconName.slice(1))
    .join('')
    .replace('.svg', '')
}
