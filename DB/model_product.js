module.exports = function(mongoose){

	// news model
  var proSchema = mongoose.Schema({
		index: { type: Number, default: 0 },
		name: String, // 产品名
		detail: String, // 产品详细介绍
		imgs: {type: Array, required: true}, // 产品图片
		classify: {type: Number, default: 0}, // 类别，0: 电源适配器，1: USB充电器, 2: 锂电池充电器
		recommend: {type: Number, default: 0}, // 是否推荐，0: 不推荐，1: 推荐
		// sec_classify: [], // 具体规格
		first_user: String, // 创建产品的人
		last_user: String, // 最后一个修改产品的人
		pv: {type: Number, default: 0},
		ifDelete: {type: Number, default: 0} // 是否删除，0: 未删除，1: 删除 
	}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

	// 新增新闻时自增自定义的id， _id: 新增的新闻的ObjectId
  proSchema.methods.incrementId = function (_id, callback) {
  	// console.log('increment: '+_id);
	  var Product = this.model('Product');
	  Product.findOne().sort({ index: -1}).exec(function(err, doc){
	  	// console.log('increment'+doc);
	  	if(doc){
	  		var index = doc.index + 1;
	  		Product.findByIdAndUpdate(_id, {$set: {index: index}}).exec(function (err, addDoc) {
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

	var Product = mongoose.model('Product', proSchema);
	
};

