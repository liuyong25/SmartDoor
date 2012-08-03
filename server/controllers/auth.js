var config = require('../config').config;

/**
 * 登录
 */
exports.login = function(req, res){
  var method = req.method.toLowerCase();
  if(method == 'post'){
    var username = req.sanitize('username').trim();
    if(!username){
      return res.render('auth/login.jade',{error:'请输入帐号和密码!!!'}); 
    }
    //保存用户信息到session
    var user = req.session.user = {
      username: username
    };
    writeAuthSession(user,res);
    res.redirect(req.session._loginReferer || '/');
  }else{
    //req.session._loginReferer = req.headers.referer;
    res.render('auth/login.jade');
  }
};

/**
 * 拦截器,检查是否登录
 */
exports.checkLogin = function(req, res, next){
  //检查session
  if(req.session.user || req.url=='/login'){ 
    return next();
  }else{
    //检查cookie
    var username= readAuthSession(req);
    if(username){
      req.session.user = {
        username: username.trim()
      }
      return next();
    }
    //转向登录界面
    req.session._loginReferer = req.url;
    res.redirect('/login');
  }
};

/**
 * 注销
 */
exports.logout = function(req, res){
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, { path: '/' });
    res.redirect(req.headers.referer || '/');
};

//========= help method =========
function writeAuthSession(user,res) {
  var auth_token = new Buffer(user.username).toString('base64');//encrypt(user.username, config.session_secret);
  res.cookie(config.auth_cookie_name, auth_token, {path: '/',maxAge: 1000*60*60*24}); //cookie 有效期1天      
}
function readAuthSession(req) {
  var username;
  var cookie = req.cookies[config.auth_cookie_name];
  if(cookie){
    var auth_token = new Buffer(req.cookies[config.auth_cookie_name], 'base64').toString('ascii');//decrypt(cookie, config.session_secret);
    username= auth_token;
  }
  return username;
}

var crypto = require('crypto');
function encrypt(str,secret) {
   var cipher = crypto.createCipher('aes192', secret);
   var enc = cipher.update(str,'utf8','hex');
   enc += cipher.final('hex');
   return enc;
}
function decrypt(str,secret) {
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}
function md5(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}
function randomString(size) {
  size = size || 6;
  var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  var max_num = code_string.length + 1;
  var new_pass = '';
  while(size>0){
    new_pass += code_string.charAt(Math.floor(Math.random()* max_num));
    size--; 
  }
  return new_pass;
}