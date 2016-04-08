module.exports = function(){

	var  mongoose = require('mongoose'),
	     db = mongoose.createConnection('mongodb://localhost/jhy');

	/*
	 *  initialize database's Schemas/Models
	 */
	require('./model_user')(mongoose);
	require('./model_news')(mongoose);
	require('./model_product')(mongoose);

	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		var db_User = db.model('User');
		var crypto = require('crypto');
		var	md5 = crypto.createHash('md5');
		// 是否已初始化
		db_User.find({email: 'chuhai.ma@gmail.com'},function(err, users){
			if(users.length<=0){
			// 未初始化时，初始化数据库
				console.log('initialize database start...');				
				var superUser = db_User({email: 'chuhai.ma@gmail.com', nickname: '楚海', password: md5.update('123456').digest('hex'), priority: 0});
				superUser.save();
				console.log('initialize database end...');
			}
		});

	});

  return db;

};

