module.exports = function(app){

	var db = require('./DB/db_initial.js')();
	var crypto = require('crypto');
	var csrf = require('csurf');
	var csrfProtection = csrf({ cookie: true });

	app.get('/', function(req, res){
	  // res.sendFile('./views/index.html', { root: __dirname });
	  res.render('./views/index.html', { nav: 0 }); //上面代码使用render方法，将message变量传入index模板，渲染成HTML网页。
	  // res.redirect("login");
	}).get('/contact', function(req, res){
		res.render('./views/contact.html', { nav: 3 });
	}).get('/about', function(req, res){
		res.render('./views/about.html', { nav: 4 });
	}).get('/logout', function(req, res){
	  req.session.destroy();
    res.redirect("/login");
	});

	app.get('/login', csrfProtection, function(req, res){
		var session = req.session;
		if(session.error){
			res.locals.error = session.error;
		}
	  res.render('./views/login.html', { csrfToken: req.csrfToken() });
	}).post('/login', csrfProtection, function(req,res){
	// 登陆
    var User = db.model('User');  
    var param = req.body; 
    User.findOne({email: param.email},function(err, user){
    	// console.log('test: '+user+' err: '+err);
      if(err){ 
        res.sendStatus(500);
        console.log(err);
      }else if(!user){ 
      // 未注册的邮箱     
        res.locals.error = '用户名不存在';
        res.render('./views/login.html'); 
      }else{ 
      // 未审核用户
      	if(user.priority===3){
      		res.locals.error = '新注册用户尚未审核通过，暂时无法使用';
        	res.render('./views/login.html', { csrfToken: req.csrfToken() }); 
      	}else if(user.priority>3){
      	// 黑名单用户
      		res.locals.error = '该账户无法使用';
        	res.render('./views/login.html', { csrfToken: req.csrfToken() }); 
      	} else {
      		var md5 = crypto.createHash('md5'),
	      			password = md5.update(param.password).digest('hex');
	        if(password != user.password){
	        // 密码错误
	          res.locals.error = "密码错误";
	          res.render('./views/login.html', { csrfToken: req.csrfToken() });
	        }else{ 
	        // 成功登陆
	          req.session.user = user;
	          res.redirect('manage');
	        }
      	}
      }
    });
	}).get('/register', csrfProtection, function(req, res){
	  res.render('./views/register.html', { csrfToken: req.csrfToken() });
	}).post('/register', csrfProtection, function(req,res){
	// 注册
    var User = db.model('User');  
    var param = req.body,
    		email = param.email,
    		password = param.password,
    		nickname = param.nickname;

    User.findOne({email: email},function(err, user){
    	if(user){      
        res.locals.error = '该邮箱已注册';
        res.render('./views/register.html', { csrfToken: req.csrfToken() }); 
      }else{
      	var	md5 = crypto.createHash('md5');
    		password = md5.update(password).digest('hex');

    		var newUser = User({email: email, password: password, nickname: nickname});
				newUser.save(function (err, user) {
				  if (err){
				  	res.locals.error = err;
        		res.render('./views/register.html', { csrfToken: req.csrfToken() }); 
				  }else{
				  	res.locals.success = '注册成功,管理员审核通过后即可使用该账号' ;
				  	res.render('./views/register.html', { csrfToken: req.csrfToken() }); 
				  }
				});
      }
    });
	});

	app.get('/manage', function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    }else{
    	res.locals.email = user.email;
	    res.locals.priority = user.priority;
	    res.render('./views/manage.html');  
    }
     
	});

	// 产品管理
	app.get('/product', function(req, res){
    var Product = db.model('Product'),
    		proIndex = req.query.index;
    console.log(proIndex+' '+ typeof proIndex);

    var moment = require('moment'),
	    	m_arr = [0,'一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

    if( proIndex ){
    	Product.findOne({index: proIndex}).select('name detail imgs pv').exec(function(err, doc){
    		doc.pv += 1;
    		doc.save();
    		res.render('./views/product_detail.html', { nav: 2, product: doc });
    	});
    }else{
    	var page = req.query.page || 1,
	    		pageSize = 10,
	    		skipNum = (page-1)*pageSize,
	    		query = {ifDelete: 0};
	    res.locals.page = page;
	    if(req.query.type){
	    	res.locals.classify = query.classify = req.query.type;
	    }
	    Product.where(query).count(function (err, count) {
			  if (err) return handleError(err);
			  res.locals.amount = Math.ceil(count/pageSize);
			});
    	Product.find(query).skip(skipNum).limit(pageSize).sort({recommend: -1, _id:-1}).select('name imgs index').exec(function(err, docs){
    		res.render('./views/product.html', { nav: 2, products: docs });
    	});
    }
	    
	}).get('/manage/product', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
	    var Product = db.model('Product'),
	    		page = req.query.page || 1,
	    		pageSize = 15,
	    		skipNum = (page-1)*pageSize,
	    		query = {};
	    res.locals.page = page;
	    Product.where(query).count(function (err, count) {
			  if (err) return handleError(err);
			  res.locals.amount = Math.ceil(count/pageSize);
			});
	    Product.find(query).skip(skipNum).limit(pageSize).sort({ifDelete: 1, recommend: -1, _id:-1}).exec(function(err, docs){
	    	// console.log(docs);
	    	var moment = require('moment');
	    	docs.forEach(function(doc){
	    		var add_time = moment(doc.created_at).format('YYYY-MM-DD HH:mm'),
	    				update_time = moment(doc.updated_at).format('YYYY-MM-DD HH:mm');
	    		doc.add_time = add_time;
	    		doc.update_time = update_time;
	    	});
	    	res.render('./views/manage_product.html', {products: docs, csrfToken: req.csrfToken()});
	    });
	    
    }
	}).get('/manage/editProduct', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
    	var renderParam = {csrfToken: req.csrfToken()};
    	if(req.query.index){
    		res.locals.operate = 1;
    		var Product = db.model('Product'),
	    			index = req.query.index;
	    	Product.findOne({index: index}).select('name classify detail imgs').exec(function(err, doc){
	    		console.log(doc);
	    		renderParam.product = doc;
	    		renderParam.index = index;
	    		res.render('./views/edit_product.html', renderParam);
	    	});
    	}else{
    		res.locals.operate = 0;
    		res.render('./views/edit_product.html', renderParam);
    	}
	    
    }
	}).post('/manage/editProduct', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
    	var Product = db.model('Product'),
    			param = req.body,
    			user = req.session.user;
    	// console.log('imgs: ' + typeof param['imgs[]']);
    	if(param.operate==0){
    	// 新增
    		console.log(param);
    		var newPro = Product({name: param.name, classify: param.classify, imgs: param['imgs[]'], detail: param.detail, first_user: user.email, last_user: user.email});
    		newPro.save(function (err, doc) {
				  if (err){
				  	console.log(err);
	      		res.status(200).send({status: 1, data: '操作数据库失败，请重试'});
				  }else{
				  	doc.incrementId(doc._id, function(index){
				  		res.status(200).send({ status: 0, data: index });
				  	});
				  }
				});
    	}else{
    	// 修改
    		var update = {name: param.name, classify: param.classify, imgs: param['imgs[]'], detail: param.detail, last_user: user.email};
    		Product.findOneAndUpdate({index: param.index}, update).exec(function(err, doc){
    			if (err){
				  	console.log(err);
	      		res.status(200).send({status: 1, data: '操作数据库失败，请重试'});
				  }else{
				  	res.status(200).send({ status: 0, data: doc.index });
				  }
    		});
    	}
    }
	}).post('/product/operate', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
    	var Product = db.model('Product'),
    			param = req.body,
    			user = req.session.user,
    			update = {};
    	update[param.operation] = param.value;
    	Product.findOneAndUpdate({index: param.index}, update).exec(function(err, doc){
    		if (err){
			  	console.log(err);
      		res.status(200).send({status: 1, data: '操作失败，请重试'});
			  }else{
			  	res.status(200).send({ status: 0 });
			  }
    	});
    }
	});

	// 新闻管理
	app.get('/news', function(req, res){
    var News = db.model('News'),
    		newsIndex = req.query.index;
    // console.log(newsIndex+' '+ typeof newsIndex);

    var moment = require('moment'),
	    	m_arr = [0,'一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

    if( newsIndex ){
    	News.findOne({index: newsIndex}).select('title content pv').exec(function(err, doc){
    		doc.pv += 1;
    		doc.save();
    		var time = moment(doc.created_at).format('M-DD'),
    				arr = time.split('-');
    		doc.month = m_arr[arr[0]];
    		doc.day = arr[1];
    		res.render('./views/news_detail.html', { nav: 2, news: doc });
    	});
    }else{
    	var page = req.query.page || 1,
	    		pageSize = 10,
	    		skipNum = (page-1)*pageSize,
	    		query = {ifDelete: 0};
	    res.locals.page = page;
	    News.where(query).count(function (err, count) {
			  if (err) return handleError(err);
			  res.locals.amount = Math.ceil(count/pageSize);
			});
    	News.find(query).skip(skipNum).limit(pageSize).sort({_id:-1}).select('title created_at index').exec(function(err, docs){
	    	docs.forEach(function(doc){
	    		var time = moment(doc.created_at).format('M-DD'),
	    				arr = time.split('-');
	    		doc.month = m_arr[arr[0]];
	    		doc.day = arr[1];
	    	});
    		res.render('./views/news.html', { nav: 2, news: docs });
    	});
    }
	    
	}).get('/manage/news', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
	    var News = db.model('News'),
	    		page = req.query.page || 1,
	    		pageSize = 15,
	    		skipNum = (page-1)*pageSize,
	    		query = {};
	    res.locals.page = page;
	    News.where(query).count(function (err, count) {
			  if (err) return handleError(err);
			  res.locals.amount = Math.ceil(count/pageSize);
			});
	    News.find(query).skip(skipNum).limit(pageSize).sort({ifDelete: 1, _id:-1}).exec(function(err, docs){
	    	// console.log(docs);
	    	var moment = require('moment');
	    	docs.forEach(function(doc){
	    		var add_time = moment(doc.created_at).format('YYYY-MM-DD HH:mm'),
	    				update_time = moment(doc.updated_at).format('YYYY-MM-DD HH:mm');
	    		doc.add_time = add_time;
	    		doc.update_time = update_time;
	    	});
	    	res.render('./views/manage_news.html', {news: docs, csrfToken: req.csrfToken()});
	    });
	    
    }
	}).get('/manage/editNews', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
    	var renderParam = {csrfToken: req.csrfToken()};
    	if(req.query.index){
    		res.locals.operate = 1;
    		var News = db.model('News'),
	    			index = req.query.index;
	    	News.findOne({index: index}).select('title content').exec(function(err, doc){
	    		// console.log(doc);
	    		renderParam.news = doc;
	    		renderParam.index = index;
	    		res.render('./views/edit_news.html', renderParam);
	    	});
    	}else{
    		res.locals.operate = 0;
    		res.render('./views/edit_news.html', renderParam);
    	}
	    
    }
	}).post('/manage/editNews', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
    	var News = db.model('News'),
    			param = req.body,
    			user = req.session.user;
    	if(param.operate==0){
    	// 新增
    		var newNews = News({title: param.title, content: param.content, first_user: user.email, last_user: user.email});
    		newNews.save(function (err, doc) {
				  if (err){
				  	console.log(err);
	      		res.status(200).send({status: 1, data: '操作数据库失败，请重试'});
				  }else{
				  	doc.incrementId(doc._id, function(index){
				  		res.status(200).send({ status: 0, data: index });
				  	});
				  }
				});
    	}else{
    	// 修改
    		var update = {title: param.title, content: param.content, last_user: user.email};
    		News.findOneAndUpdate({index: param.index}, update).exec(function(err, doc){
    			if (err){
				  	console.log(err);
	      		res.status(200).send({status: 1, data: '操作数据库失败，请重试'});
				  }else{
				  	res.status(200).send({ status: 0, data: doc.index });
				  }
    		});
    	}
    }
	}).post('/news/delete', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    } else {
    	var News = db.model('News'),
    			param = req.body,
    			user = req.session.user;
    	News.findOneAndUpdate({index: param.index},{ifDelete: param.operation}).exec(function(err, doc){
    		if (err){
			  	console.log(err);
      		res.status(200).send({status: 1, data: '操作失败，请重试'});
			  }else{
			  	res.status(200).send({ status: 0 });
			  }
    	});
    }
	});
	// 上传图片
	app.post('/upload/product', function (req, res) {
		var user = req.session.user;
	  if(!user){      
			res.status(200).send({status: 1, data: '还没登陆'});
    } else {
    	var multer = require('./multerUtil.js');
			var upload = multer.single('product_img');
		  upload(req, res, function (err) {
		    if (err) {
		      // An error occurred when uploading
		      res.status(200).send({status: 1, data: err});
		      return
		    }
		    var filePath = req.file.path,
		    		temp = filePath.indexOf('/upload/product/'),
		    		result = filePath.slice(temp);
		    res.status(200).send({status: 0, data: result});
		  });
    }
		
	});

	// 用户管理
	app.get('/manage/user', csrfProtection, function(req, res){
		var user = req.session.user;
	  if(!user){      
			req.session.error = "请先登录";
      res.redirect("/login"); 
    }else if(user.priority<=1){
	    res.locals.priority = user.priority;
	    var User = db.model('User'),
	    		page = req.query.page || 1,
	    		pageSize = 15,
	    		skipNum = (page-1)*pageSize,
	    		query = {};
	    res.locals.page = page;
	    if(user.priority===1){
	    // 管理员用户，没有权限管理其他管理员
	    	query.priority = {"$gt": 1};
	    }else{
	    	query.priority = {"$gt": 0};
	    }
	    console.log(page);
	    User.where(query).count(function (err, count) {
			  if (err) return handleError(err);
			  res.locals.amount = Math.ceil(count/pageSize);
			  console.log(count);
			});
	    User.find(query).skip(skipNum).limit(pageSize).sort({ priority: 1, _id:-1}).exec(function(err, docs){
	    	// console.log(docs);
	    	var moment = require('moment');
	    	moment.locale('zh-cn');
	    	docs.forEach(function(doc){
	    		var time = moment(doc.created_at).format('YYYY年MM月DD日 HH:mm:ss dddd');
	    		doc.time = time;
	    	});
	    	res.render('./views/manage_user.html', {users: docs, csrfToken: req.csrfToken()});
	    });
	    
    }else{
    	res.locals.priority = user.priority;
    	res.render('./views/manage_user.html', { csrfToken: req.csrfToken() });
    }   
	}).post('/user/changePassword', csrfProtection, function(req,res){
	// 修改密码
    var User = db.model('User');  
    var oldPsw = crypto.createHash('md5').update(req.body.old_psw).digest('hex'),
    		user = req.session.user;

    if(oldPsw===user.password){
    	var newPsw = crypto.createHash('md5').update(req.body.new_psw).digest('hex');
    	User.findByIdAndUpdate(user._id,{$set: {password: newPsw}}).exec(function(err, doc){
    		if(err) {
    			console.log('err: '+err);
    			res.status(200).send({status: 2});
    		}
    	});
    	user.password = newPsw;
    	res.status(200).send({status: 0});
    }else{
    	res.status(200).send({status: 1});
    }
  }).post('/user/changePriority', csrfProtection, function(req,res){
	// 修改密码
    var User = db.model('User');  
    var userId = req.body.user_id,
    		priority = req.body.priority;
    // 只有超级管理员有权设置用户为管理员
    if(priority===1&&req.session.user.priority!=0){
  		res.status(200).send({status: 1});
    }else{
    	User.findByIdAndUpdate(userId,{$set: {priority: priority}}).exec(function(err, doc){
    		if(err) {
    			console.log('err: '+err);
    			res.status(200).send({status: 2});
    		}
    	});
    	res.status(200).send({status: 0});
    }
  });



};

