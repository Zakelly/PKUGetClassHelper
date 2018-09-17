/*
 * 选课函数
 * @author Zakelly
 */


var electUrl="http://elective.pku.edu.cn/elective2008/edu/pku/stu/elective/controller/supplement/electSupplement.do?index=%input_index&seq=%input_number";

function elect(course) {
    if (!course || course.isDone)
        return false;
    var url = electUrl.replace('%input_index',course.index).replace('%input_number',course.number);
    jQuery.ajax({
        url:url,
        type:"get",
        dataType:'html',
        async:false,
        timeout:5000,
        success:function(t){
            electDone(course, t);
        },
        error:function(e,f){
            eventHandler.electError(course,f);
        }
    });
}

function electDone(course, html) {
    if (html.indexOf("message_success")>=0){
        course.isDone = true;
        Course.prototype.refreshIndex(course.index);
        eventHandler.electSuccess(course);
    }
    else
    if (html.indexOf("出错提示")>=0){
        var r= html.substr(html.indexOf("出错提示")+14);
        r=r.substr(0, html.indexOf("<br"));
        if (r.length>10){
            r=r.substr(0,10);
        }
        eventHandler.electError(course, r);
    }
    else
    if (html.indexOf("message_error")>=0){
        var r= html.substr(html.indexOf("message_error")+15);
        r=r.substr(0, html.indexOf("</label>"));
        if (r.length>10){
            r=r.substr(0,10);
        }
        eventHandler.electError(course, r);
    }
    else{
        eventHandler.electError(course, "未知");
    }

}