function readCourseList() {
    var rtn = JSON.parse(localStorage.getItem('courseList'));
    return rtn == null ? [] : rtn;
}

function writeCourseList(cl) {
    localStorage.setItem('courseList', JSON.stringify(cl));
}

function addToCourseList(hash) {
    var cl = readCourseList();
    if (cl.indexOf(hash) == -1) {
        cl.push(hash);
        writeCourseList(cl);
    }
}

function deleteFromCourseList(hash) {
    var cl = readCourseList();
    cl.splice(cl.indexOf(hash), 1);
    writeCourseList(cl);
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