/**
 * 在线聊天
 */
$(window).load(function(){

  var socket = io.connect('/chat');

  //注册socket事件
  var initSocketlistener = function(){

    //=========== 系统消息 ===========
    socket.on('connecting', function(){
      clearMsg();
      showMsg('正在登陆...');
    });       

    socket.on('connect', function(){
      showMsg('已进入房间!在发送的消息前面加"@对方名字"+空格+消息可以给某人发送私信。');
    })

    socket.on('connect_failed', function(reason){
      showMsg('无法连接服务器,错误信息:' + reason);
    });
    
    socket.on('error', function(reason){
      showMsg('无法连接服务器,错误信息:' + reason);
    });

    socket.on('disconnect', function(){
      showMsg('连接已断开...');
    });

    socket.on('reconnecting', function(){
      showMsg('正在重新登陆...');
      window.location.reload();
    }); 

    socket.on('reconnect', function(){
      //clearMsg();
      //showMsg('正在重新登陆...');
    });  

    socket.on('reconnect_failed', function(){
      showMsg('重新登陆失败...');
    });  

    //=========== 聊天事件 ===========
    //更新在线用户
    socket.on('onlinelist', function(userlist,you) {
      refreshOnline(userlist,you)
    });

    //新用户加入
    socket.on('join', function (username) {
      showMsg('【' + username + '】回来了，大家赶紧去找TA聊聊~~');
    });

    //用户掉线
    socket.on('leave', function (username) {
      showMsg('【' + username + '】无声无息地离开了~~');
    });

    //群聊
    socket.on('talk', function (msg,username) {
      showMsg(msg,username,'talk');
    });

    //私信
    socket.on('whisper', function (msg,username) {
      showMsg(msg, username + '[悄悄对你说]', 'whisper');
    });

    //找不到私聊用户
    socket.on('nofound', function (msg,target,error) {
      msg = formatStr('刚才发给[{0}]的消息[{1}]不成功,{2}',msg,target,error);
      showMsg(msg, null, 'error');
    });
  }

  /**
   * 显示一条消息
   * @param msg 消息内容
   * @param from 消息发起者
   * @param type 消息类型: system,error,talk,whisper
   * @param tpl 自定义模版
   */
  var showMsg = function(msg, from, type, tpl){
    var tpl = tpl || 
      '<div class="message-holder message-type-{type} alert alert-info">'
    +   '<div class="message-header">'
    +     '<span class="message-from label {headerType}">{from}</span>'
    +     '<span class="message-timestamp">    {time}</span>'
    +   '</div>'
    +   '<div class="message-text">{msg}</div>'
    + '</div>';

    var headerType = 
      (!type || type=='system' || type=='error') 
      ? 'label-important' 
      : (type=='whisper') ? 'label-info' : '';
    var html = formatStr(tpl,{
      from: formatHTML(from || '系统'),
      msg: formatHTML(msg),
      time: formatDate(new Date(),'H:i:s'),
      type: type || 'system',
      headerType: headerType
    });
    $('#msglist').append(html).scrollTop(+1000);
  }

  //清空所有消息
  var clearMsg = function(){
    $('#msglist .message-holder').remove();
  }

  /**
   * 发送一条消息
   */
  var sendMsg = function(){
    var msg = $.trim($('#chat-input').val());
    if(msg.length==0) return;

    //检查是否是私信(@+昵称+空格+内容)
    var content = msg.match(/^@(.+)? (.*)$/);
    if(content){
      socket.emit('whisper', content[2], content[1], function(ok){
        if(ok){
          showMsg(msg, '你', 'talk');
          $('#chat-input').val('').focus();
        }
      });
    }else{
      socket.emit('talk', msg, function(ok){
        if(ok){
          showMsg(msg, '你', 'talk');
          $('#chat-input').val('').focus();
        }
      });    
    }
  }

  /**
   * 刷新在线用户
   */
  var refreshOnline = function(userlist,you){
    var html = formatStr('<li class="nav-header">当前在线({0}人)</li><li class="divider"/>',userlist.length);
    //智能提示
    var typeahead = [];
    for (var i = 0; i< userlist.length; i++) {
      var userInfo = userlist[i];
      html += formatStr('<li class="userinfo"><a href="#"><i class="icon-user"/>{0}</a></li>',userInfo.username);
      typeahead.push('"@' + userInfo.username + ' "');
    }
    html += '<li class="divider"/><li><span class="label label-info">提示</span></li><li>点击用户名,或直接输入框输入@可以智能提示</li>';
    $('#userlist').html(html);
    $('#userlist .userinfo a').click(function(){
      setWhisperTarget($(this).text());
    });

    //智能提示
    var typeaheadHtml = formatStr('[{0}]',typeahead.join(','));
    $('#chat-input').attr('data-source',typeaheadHtml);
  }

  /**
   * 在输入框中@某人
   */
  var setWhisperTarget = function(to){
    var chatfield = $('#chat-input');
    var msg = chatfield.val();
    var content = msg.match(/^@(.+)? (.*)$/);
    if(content){
      msg = content[2];
    }
    chatfield.val('@' + to + ' ' + msg).focus();
  }

  //初始化
  var init = function(){
    initSocketlistener();
    $('#chat-send').click(sendMsg);
    $('#chat-input').keypress(function(e){
      if (e.keyCode === 13) {
        sendMsg();
        return false;
      }
    });
  };

  init();
});