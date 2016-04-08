module.exports = function(mongoose){

	// user model
  var userSchema = mongoose.Schema({
		email: { type: String, unique: true, required: true },
		password: String,
		nickname: String,
		// register_time: { type: Date, default: Date.now },
		// ifVerify: {type: Number, default: 0}, // 注册用户是否认证，未认证的用户不能正常使用。0：未审核认证，1：已审核认证
		// ifDelete: {type: Number, default: 0}, // 是否删除，0: 未删除，1: 删除 
		priority: {type: Number, default: 3}  // 账户权限，0: 超级管理员，1: 管理员，2: 普通用户，3: 未审核，4: 黑名单用户
	}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

	userSchema.methods.speak = function () {
	  // do something
	}
	var User = mongoose.model('User', userSchema);
	
};

