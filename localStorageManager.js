function readCourseList() {
    var rtn = JSON.parse(localStorage.getItem('courseList'));
    return rtn == null ? [] : rtn;
}

function writeCourseList(cl) {
    localStorage.setItem('courseList', JSON.stringify(cl));
}

function writeTxtInterval(txtInterval) {
    localStorage.setItem('txtInterval', txtInterval);
}

function readTxtInterval() {
    var rtn = JSON.parse(localStorage.getItem('txtInterval'));
    return rtn == null ? 15 : rtn;
}

function readMenuCaptchaConfig() {
    var rtn = JSON.parse(localStorage.getItem('menuCaptchaConfig'));
    return rtn == null ? 2 : rtn;
}

function writeMenuCaptchaConfig(value) {
    localStorage.setItem('menuCaptchaConfig', value);
}

function writeNavsConfig(value) {
    localStorage.setItem('navsConfig', value);
}

function readNavsConfig() {
    var rtn = JSON.parse(localStorage.getItem('navsConfig'));
    return rtn == null ? 0 : rtn;
}

function addToCourseList(seqno) {
    var cl = readCourseList();
    if (cl.indexOf(seqno) == -1) {
        cl.push(seqno);
        writeCourseList(cl);
    }
}

function deleteFromCourseList(seqno) {
    var cl = readCourseList();
    cl.splice(cl.indexOf(seqno), 1);
    writeCourseList(cl);
}