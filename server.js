/*
 * 内部API
 * @author Zakelly
 */

var VERSION = 2018092301;
var VERSION_STR = "2.3.1";
var URL_VERSION = 'http://api.zakelly.com/getclasshelper/version';
var sound = null;


/**
 * @description 得到当前版本字符串
 * @returns {string|*}
 */
function getVersion() {
    return VERSION_STR;
}

/**
 * @description 检查更新
 * @param show {boolean} 已经为最新时是否弹出桌面通知
 */
function checkUpdate(show) {
    jQuery.ajax({
        type: "GET",
        url: URL_VERSION,
        data: 'json',
        timeout: 5000,
        success: function (data) {
            if (data.version > VERSION) {
                desktopNotify('warning','有新版本！','新版本'+data.versionString+'可用，请点击此处下载。如果您使用的是Chrome商店下载的版本，请在Chrome扩展程序页面点击更新并重启Chrome。',
                function() {
                    var a = jQuery("<a href='"+data.downloadUrl+"' target='_blank'></a>").get(0);
                    var e = document.createEvent('MouseEvents');
                    e.initEvent('click', true, true);
                    a.dispatchEvent(e);
                });
            }
            else if (show) {
                desktopNotify('success','已经是最新版本','您正在使用的版本是最新版本。',null);
            }
        },
        error: function() {
            if (show) {
                desktopNotify('error','查询失败','网络不通，或服务器错误',null);
            }
        }
    });
}

/**
 * @description 显示桌面通知
 * @param icon {'warning'|'error'|'success'} 图标
 * @param title {string} 题目
 * @param body {string} 内容
 * @param clickFunc {function|null} 鼠标点击触发函数
 */
function desktopNotify(icon, title, body, clickFunc) {
    try{
        var n = new Notification(title, {
            'icon':'http://elective.pku.edu.cn/elective2008/resources/images/'+icon+'.gif',  // icon url - can be relative
            'body':body  // notification body text
        });
        n.onclick = clickFunc;
        setTimeout(function(){if (n) n.close();},5000);
    }
    catch(e){}
}

var loadSound = function(){
    sound=new Audio;
    sound.src= chrome.extension.getURL('resources/mando-5.mp3');
    sound.load();
};


/**
 * @description 播放提示音
 * @param loop {boolean} 是否循环
 */
function playSound(loop){
    if (sound == null){
        loadSound();
    }
    sound.loop = (loop == true);
    sound.play();
}

/**
 * @description 停止提示音
 */
function stopSound(){
    if (sound != null) {
        sound.pause();
        sound.currentTime = 0;
    }
}
