var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var ueditor = require("ueditor");
var compression = require('compression');

var express = require('express'),
		app = express();

// 允许加载静态文件
app.use(express.static('public', { maxAge: 60 * 1000 * 60 * 2 }));
// 设定views变量，意为视图存放的目录
app.set('views', __dirname);

// 设定port变量，意为访问端口
// app.set('port', process.env.PORT || 3000);
// 设定views变量，意为视图存放的目录
// app.set('views', path.join(__dirname, 'views'));

// 设定view engine变量，意为网页模板引擎
app.engine('.html', require( 'ejs' ).__express);
app.set('view engine', 'html');


app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(logger('combined'));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

app.use(session({ 
    secret: 'jhy',
    resave: true,
    saveUninitialized: true,
    cookie:{ 
      maxAge: 24*60*60*1000
    }
}));

// ueditor编辑器
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
  // ueditor 客户发起上传图片请求
  if(req.query.action === 'uploadimage'){
    var foo = req.ueditor;
    var date = new Date();
    var imgname = req.ueditor.filename;

    var img_url = '/upload/ueditor/';
    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage'){
    var dir_url = '/upload/ueditor/';
    res.ue_list(dir_url);  // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/ueditor.config.json')
  }
}));

//
var router = require('./router.js')(app);

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('<h1>出错啦</h1>');
});


