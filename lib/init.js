var config = require('./config')
var Temp = require('./utils/temp')
var fs = require('./utils/fs-plus2')
var baseModel = require('./model/base_model')
var view = require('./view')()

function cleanIfConfigChanged() {
  var stat = fs.statSync(config.configFile)
  var lastPostTime = Temp.getBuildInfo('lastPostTime')
  if (lastPostTime && lastPostTime < stat.mtime.getTime()) {
    var path = require('path')
    logger.info('config.yaml or theme is modified, regenerate all')
    Temp.clear()
    config.loadConfig()
  }
}

function isAssetsChanged(src, dst) {
  return !fs.existsSync(dst) || fs.statSync(src).mtime.getTime() > fs.statSync(dst).mtime.getTime()
}

function copyAssets() {

  var copyFile = [{
    src: config.paths.files,
    dst: config.paths.public
  },{
    src: config.paths.theme + '/assets',
    dst: config.paths.public + '/assets'
  },{
    src: config.paths.theme + '/favicon.ico',
    dst: config.paths.public + '/favicon.ico'
  }, {
    src: __dirname + '/../assets/jquery.min.js',
    dst: config.paths.public + '/public/jquery.min.js'
  }]
  copyFile.forEach(function(copy) {
    if (fs.existsSync(copy.src)) {
      fs.copy(copy.src, copy.dst, isAssetsChanged)
    }
  })
}

exports.init = function(){
  cleanIfConfigChanged()
  copyAssets()
  baseModel.init()
  view.buildTemp()
}
