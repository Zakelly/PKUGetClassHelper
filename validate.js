/*
 * 验证码验证逻辑
 * @author Zakelly
 */
var url = "http://elective.pku.edu.cn/elective2008/edu/pku/stu/elective/controller/supplement/validate.do?validCode=";
/**
 * 验证验证码是否正确
 * @param code {string} 验证码
 */
function validate(code) {
    jQuery.ajax({
        url: url+code,
        type:"post",
        dataType:'html',
        async:true,
        timeout:5000,
        success:function(t){
            if (t.indexOf("2") >=0){
                eventHandler.validatePass();
            }
            else{
                eventHandler.validateNotPass("验证码不正确");
            }
        },
        error:function(){
            eventHandler.validateNotPass("超时或未知错误");
        }
    });
}