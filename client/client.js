
//依赖模块
var config = require('./config').config;
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var _ = require("underscore");
var io = require('socket.io/node_modules/socket.io-client');

//建立客户端连接
var client = io.connect(config.remoteUrl,{query: querystring.stringify(config.queryObj)});

//===== 注册事件 ======
client.on('connect', function(){
  console.log('connected');
});

client.on('connect_failed', function(e){
  console.log('无法连接服务器,错误信息:%s', e);
});

client.on('error', function(e){
  console.log('服务器拒绝连接,错误信息:%s', e);
});

client.on('disconnect', function(e){
  console.log('已断开与服务器的连接.%s', e);
});

//指令处理
client.on('message',function(data,fn){
  //TODO: check if is object {cmd:'',masterId:'',slaveId:'',params:...}
  switch(data.cmd){
    //list fileName: {cmd:'ls',path:path,masterId:masterId}
    //result: {cmd:'ls',clientId:'',masterId:'',data:[{name:'',path:'',type:'',size:'',mtime:''}]}
    /**
     * list file request
     * @param {string} path
     */
    case 'ls':
      data.result = listFile('.\\node_modules\\socket.io'||data.path);
      // console.log
      data.result.forEach(function(item){
        if(item.type=='dir'){
          console.log(item.filePath)
          console.log(listFile(item.filePath))
        }
      })
      //client.send(data);
      break;
  }

})



/**
 * 列出指定目录下的文件列表
 * @param  {[type]} filePath [description]
 * @return {[type]}      [description]
 */
var listFile = function(filePath){
  var result = [];
  if(fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()){
    var dir = fs.readdirSync(filePath);
    dir.forEach(function(fileName){
      var stat = fs.lstatSync(path.join(filePath,fileName));
      console.log('~',path.join(filePath,fileName),stat.isSymbolicLink())
      if(stat.isFile() || stat.isDirectory()){
        stat.name = fileName;
        stat.type = stat.isFile() ? 'file' : 'dir';
        stat.filePath = fs.realpathSync(fileName);
        result.push(stat);
      }
    });
  }
  return result;
}