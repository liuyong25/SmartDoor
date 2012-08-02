/**
 * 格式化HTML
 */
function formatHTML(html){
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 格式化字符串模版,支持2种格式:
 * formatStr("i can speak {language} since i was {age}",{language:'javascript',age:10});
 * formatStr("i can speak {0} since i was {1}",'javascript',10});
 */
function formatStr(tpl,obj){
  obj = typeof obj === 'object' ? obj : Array.prototype.slice.call(arguments, 1);
  return tpl.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
      if (m == "{{") { return "{"; }
      if (m == "}}") { return "}"; }
      return obj[n];
  });
};

/**
 * 格式化日期
 * //TODO:未完全实现
 */
function formatDate(date, format){
  format = format || 'Y-m-d H:i:s';
  return ('0'+date.getHours()).substr(-2,2)+':'+('0'+date.getMinutes()).substr(-2,2)+':'+('0'+date.getSeconds()).substr(-2,2);
}