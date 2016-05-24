// var fs = require('fs-plus')
var path = require('path')
var fs = require('fs')

function assign(){
  return [].slice.call(arguments).reduce(function(dst, obj){
    return Object.keys(obj).reduce(function(dst, key){
      dst[key] = obj[key]
      return dst
    }, dst)
  }, {})
}

function copyFile(src, dst){
  fs.makeTree(path.dirname(dst), function(err){
    err && console.error(err)
    fs.createReadStream(src)
      .pipe(fs.createWriteStream(dst))
  })
}

function mkdirp(path) {
  if(fs.existsSync(path)){
    return;
  }
  let cur_path = ''
  path.split('/').forEach(function(part){
    cur_path = [cur_path, part].join('/')
    if (!fs.existsSync(cur_path)){
      fs.mkdirSync(cur_path)
    }
  })
}

var copySync = fs.copySync
var writeFileSync = fs.writeFileSync
module.exports = assign(fs, {
  mkdirp: mkdirp,
  writeFileSync: function() {
    let dirname = path.dirname(arguments[0])
    mkdirp(dirname)
    return writeFileSync.apply(fs, arguments)
  },
  copy: function(src, dst, filter) {
    var fs = this
    if(!fs.existsSync(src)){
      return false
    }
    var srcStat = fs.statSync(src)
    if(srcStat.isDirectory()){
      fs.readdir(src, function(err, children){
        err && console.error(err)
        children.forEach(function(child){
          fs.copy(src+'/'+child, dst+'/'+child)
        })
      })
    }else if(!filter || filter(src, dst)){
      copyFile(src, dst)
    }
  },
  copySync: function(src, dst, filter){
    var fs = this
    if(!fs.existsSync(src)){
      return false
    }
    var srcStat = fs.statSync(src)
    if(srcStat.isDirectory()){
      copySync.call(fs, src, dst)
    }else if(!filter || filter(src, dst)){
      copyFile(src, dst)
    }
  },
  walkSync: function (root, cb){
    var fs = this
    var children = fs.readdirSync(root)
    children.forEach(function(child){
      var childFile = root + '/' + child
      var stat = fs.statSync(childFile)
      cb && cb(childFile, stat)
      if(stat.isDirectory()){
        fs.walkSync(childFile, cb)
      }
    })
  }

})
