/*
 * 课程类
 * @author Zakelly
 */

// 需要的域：除了构造参数，还需要$tr、name、currElectNum、maxElectNum
var Course = function(id, number, index) {
    this.id = id;
    this.number = number;
    this.index = index;
    this.isDone = false;
};


Course.prototype.courses = new Map();
Course.prototype.elect = function() {
    elect(this);
};
Course.prototype.save = function () {
    this.courses.put(this.id, this);
};
Course.prototype.refreshIndex = function(i) {
    if (i > 0) {
        for(var course in this.courses) {
            if (course.index > i) {
                course.index--;
            }
        }
    }
};
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
Course.prototype.getHash = function () {
    return (this.id + this.index).hashCode();
};