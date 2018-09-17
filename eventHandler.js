/*
 * 回调函数
 * @author Zakelly
 */


EventHandler = function() {
    this.electSuccess = function(course){};
    this.electError = function(course, message) {};
    this.validatePass = function() {};
    this.validateNotPass = function(message) {};
};

eventHandler = new EventHandler();