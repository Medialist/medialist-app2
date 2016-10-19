const fs = require('fs')
const path = require('path')
const async = require('async')
const svgSourceDir = path.join(__dirname, '..', 'svgs', 'icons')

async.waterfall([
  readSvgDir,
  createIndex,
  extractSvgs,
  createComponents
], function (err) {
  if (err) throw err
})

function readSvgDir (next) {
  fs.readdir(svgSourceDir, next)
}

function extractSvgs (icons, next) {
  async.map(icons, function (icon, finish) {
    const readPath = path.join(svgSourceDir, icon)
    const fileName = icon.replace('.svg', '.jsx')
    fs.readFile(readPath, (err, def) => finish(err, {fileName, def}))
  }, next)
}

function createComponents (svgs, next) {
  async.map(svgs, function (svg, finish) {
    const writePath = path.join(__dirname, '..', '..', 'imports', 'ui', 'images', 'icons', svg.fileName)
    const fileContent = wrap(svg)
    fs.writeFile(writePath, fileContent, finish)
  }, next)
}

function wrap (svg) {
  const ComponentName = toCamalCase(svg.fileName)
  const iconName = svg.fileName.replace('.jsx', '')
  return `import React from 'react'
//This component is generated by /private/build/createSvgComponents.jsx
function setSvg () { return {__html: '${svg.def}'} }
function ${ComponentName} () { return (<span className="svg-icon svg-icon-${iconName}" dangerouslySetInnerHTML={setSvg()}></span>) }
export default ${ComponentName}\n`
}

function toCamalCase (slug) {
  return slug
    .split('-')
    .map((iconName) => iconName.charAt(0).toUpperCase() + iconName.slice(1))
    .join('')
    .replace('.svg', '')
    .replace('.jsx', '')
}

function createIndex (icons, next) {
  const writePath = path.join(__dirname, '..', '..', 'imports', 'ui', 'images', 'icons', 'index.js')
  const index = [createListOfImports(icons), createListOfExports(icons)].join('')
  fs.writeFile(writePath, index, (err) => next(err, icons))
}

function createListOfImports (icons) {
  return icons.reduce((imp, icon) => {
    imp += `import ${toCamalCase(icon)} from './${icon.replace('.svg', '.jsx')}'\n`
    return imp
  }, '')
}

function createListOfExports (icons) {
  return icons.reduce((exp, icon, i) => {
    exp += '  '
    exp += toCamalCase(icon)
    if (i !== icons.length - 1) exp += ',\n'
    if (i === icons.length - 1) exp += '\n}\n'
    return exp
  }, 'export {\n')
}
