var request = require('request'),
    cheerio = require('cheerio'),
    http = require('http'),
    url = require('url');

var host = 'http://baike.baidu.com/view/39744.htm';

var html = [];
setInterval(scraper(host), 1000*60*15);//15 分钟更新一次
function scraper (host) {
  request(host, function (error, response, data) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(data);
      var title = $('.title').first().text(),
          header = [],
          nav = [],
          body = [];
      //删除无用数据
      $('.title').remove();
      $('.pic-info').remove();
      $('.count').remove();
      $('sup').remove();
      //筛选有用数据
      $('#lemmaContent-0 .headline-1').each(function (i) {
        var str = '',
            $next = $(this).next();
        while (!$next.hasClass('headline-1')&&(!$next.next().hasClass('clear'))) {
          if ($next.hasClass('headline-2')) {
            str += "<p><strong>" + $next.text() + "</strong></p>";
          } else {
            str += "<p>" + $next.text() + "</p>";
          }
          $next = $next.next();
        }
        header.push($(this).find('.headline-content').text());
        nav.push("<span><a href='/" + i + "'>" + header[i] + "</a></span>");
        body.push(str);
      });

      var len = $('#catalog-holder-0 .catalog-item').length;//获取 “目录” 条文数
      for (var i = 0; i < len;  i++) {
        html[i] = "" +
        "<!DOCTYPE html>" +
        "<html>" +
        "<head>" +
        "<meta charset='UTF-8' />" +
        "<title>" + title + "</title>" +
        "<style type='text/css'>" +
        "body{width:600px;margin:2em auto;font-family:'Microsoft YaHei';}" +
        "p{line-height:24px;margin:1em 0;}" +
        "header{border-bottom:1px solid #cccccc;font-size:2em;font-weight:bold;padding-bottom:.2em;}" +
        "nav{float:left;font-family:'Microsoft YaHei';margin-left:-12em;width:9em;text-align:right;}" +
        "nav a{display:block;text-decoration:none;padding:.7em 1em;color:#000000;}" +
        "nav a:hover{background-color:#003f00;color:#f9f9f9;-webkit-transition:color .2s linear;}" +
        "</style>" +
        "</head>" +
        "<body>" +
        "<header>" + header[i] + "</header>" +
        "<nav>" + nav.join('') + "</nav>" +
        "<article>" + body[i] + "</article>" +
        "</body>" +
        "</html>";
      }
    }
  });
}

http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname;
  path = path == '/' ? 0 : parseInt(path.slice(1));
  res.writeHead(200, {"Content-Type":"text/html"});
  res.end(html[path]);
}).listen(3000);

console.log('Server running at localhost:3000');