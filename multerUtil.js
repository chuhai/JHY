var  multer=require('multer');
var storage = multer.diskStorage({
 //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, __dirname +'/public/upload/product/')
   }, 
 //给上传文件重命名，获取添加后缀名
  filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");
      cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});  
//添加配置文件到muler对象。
var upload = multer({
  storage: storage,
  limits:{fileSize: 2*1024*1024, files: 1}
});

//导出对象
module.exports = upload;