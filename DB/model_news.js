module.exports = function(mongoose){

	// news model
  var newsSchema = mongoose.Schema({
		index: { type: Number, default: 0 },
		title: String,
		content: String,
		first_user: String, // 创建新闻稿的人
		last_user: String, // 最后一个修改新闻稿的人
		pv: {type: Number, default: 0},
		ifDelete: {type: Number, default: 0} // 是否删除，0: 未删除，1: 删除 
	}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

	// 新增新闻时自增自定义的id， _id: 新增的新闻的ObjectId
  newsSchema.methods.incrementId = function (_id, callback) {
  	// console.log('increment: '+_id);
	  var News = this.model('News');
	  News.findOne().sort({ index: -1}).exec(function(err, doc){
	  	// console.log('increment'+doc);
	  	if(doc){
	  		var index = doc.index + 1;
	  		News.findByIdAndUpdate(_id, {$set: {index: index}}).exec(function (err, addDoc) {
	  			if(err) {console.log(err);return;}
	  			callback && callback(index);
	  			index = null;
	  			console.log('increment success...');
	  		});
	  	}else{
	  		callback && callback(0);
	  	}
    });
	}

	var News = mongoose.model('News', newsSchema);
	
};

