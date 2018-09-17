/*
 * 内部频率限制
 * @author Zakelly
 */

nowTimes = 0;

function getLocalStorage(){
    checkDate();
    var v=localStorage["gchv"];
    if (v==null){
        localStorage["gchv"]=VERSION;
    }
    else{
        var vn=parseInt(localStorage["gchv"]);
        if (isNaN(vn)||(vn < VERSION)){
            localStorage["gchv"]=VERSION;
            localStorage["gcht"]=0;
        }
    }
    var t=localStorage["gcht"];
    if (t==null){
        localStorage["gcht"]=0;
        t = 0;
    }
    return parseInt(t);
}

function checkDate(){
    var d=new Date();
    var dl=localStorage["gchd"];
    d=parseInt(d.getDate());
    if (isNaN(d)){
        d=0;
    }
    if (dl==null){
        localStorage["gchd"]=d;
        localStorage["gcht"]=0;
    }
    else{
        var dl=parseInt(localStorage["gchd"]);
        if (isNaN(dl)||(dl != d)){
            localStorage["gchd"]=d;
            localStorage["gcht"]=0;
        }
    }
}

function incNowTimes(){
    nowTimes++;
    localStorage["gcht"] = nowTimes;
    return nowTimes;
}

nowTimes = getLocalStorage();
limitTimes = 6000;