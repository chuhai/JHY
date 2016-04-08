function $ajax(url, type, data, dataType, success, error){
  // showLoading();
  $.ajax({
      url : url,
      type: type || 'get',
      data: data || {},
      timeout : 30000,
      dataType: 'json',
      success: function(data){
          // removeLoading();
          $.isFunction(success) && success(data);
      },
      error: function(jqXHR, textStatus){
          // removeLoading();
          if (textStatus === 'timeout') {
            // requestErrorTip();
          } else {
            // requestTimeoutTip();
          }
          $.isFunction(error) && error(data);
      }
  });
}

//
function GetQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"),
        r = window.location.search.substr(1).match(reg);

    if (r!=null) {
        return  decodeURIComponent(r[2]);
    } return null;
}
//
function getTargetString(string, target){
    var reg = new RegExp("(^|&)"+ target +"=([^&]*)(&|$)"),
            r = string.substr(1).match(reg);

  if (r!=null) {
      return  decodeURIComponent(r[2]);
  }else{
    if(target=='router'){
        return 'page00';
    }
  }
}
// 检测是否符合手机规格
function checkIfPhone(phone){
    var regmTel = /^1\d{10}$/;
    if( regmTel.test(phone.trim()) ){
        return true;
    }else{
        return false;
    }
}