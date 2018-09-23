/*
 * 附加到选课页面的交互逻辑
 * @author zhouhy
 */

// 读取参数的jQuery插件
(function ($) {
    if ($.QueryString)
        return;

    $.QueryString = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    var coursesPerPage = 50;

    // 返回tr的jQuery集合
    function LoadCourses(fromid, retry, callback) {
        var collection = null;

        // 获得从id开始的下coursesPerPage个课程
        function GetNext(id, retry) {
            $.get("http://elective.pku.edu.cn/elective2008/edu/pku/stu/elective/controller/supplement/supplement.jsp?netui_row=electableListGrid%3B" + id, function (html) {
                if (!html)
                    if (retry)
                        return setTimeout(GetNext, 500, fromid, retry);
                    else
                        return callback(false);

                var newPageContent = $(html).find("table.datagrid:eq(0) tr:gt(0)");

                if (!collection)
                    collection = newPageContent.filter(":lt(" + (newPageContent.length - 2) + ")");
                else
                    collection = collection.add(newPageContent.filter(":lt(" + (newPageContent.length - 2) + ")"));
                if (newPageContent.length - 2 == coursesPerPage)
                    GetNext(id + coursesPerPage);
                else
                    callback(collection);
            }).fail(function () {
                if (retry)
                    return setTimeout(GetNext, 500, fromid, retry);
                else
                    return callback(false);
            });
        }

        GetNext(fromid, retry);
    }

    $(document).ready(function () {
        try {
            if (arguments.callee.hasExecuted)
                return;
            else
                arguments.callee.hasExecuted = true;
        } catch (e) {
        }

        $('.dropdown-toggle').dropdown();

        // 拉取所有课程到一页
        var currID = $.QueryString["netui_row"] || 0; // 找到参数中的当前页号
        if (currID != 0)
            currID = parseInt(currID.substr(currID.indexOf(";") + 1));
        var currInPage = $("table.datagrid:eq(0) tr").length - 3; // 当前页有多少待选课程

        if (currInPage == coursesPerPage)
            LoadCourses(currID + coursesPerPage, true, function (courses) {
                $("table.datagrid:eq(0)").append(courses);
                setTimeout(Final, 1); // 清除递归
            });
        else
            Final();

        if (currID == 0)
            $("table.datagrid:eq(0) tr:gt(" + currInPage + ")").remove();

        function Final() {

            var worked = false; // 是否有已满课程，如果没有则不必加载插件
            var validateDone = false;

            // 最后一个参数可能无
            function ArgParse(firsthref, lasthref, index, salt) {
                var id = firsthref.attr("href").split("course_seq_no=")[1];
                var seq_no = "";
                if (lasthref.attr("href").indexOf("javascript") >= 0) {
                    seq_no = lasthref.attr("onclick").split("\',\'")[4];
                }
                else {
                    seq_no = lasthref.attr("href").split("&seq=")[1];
                }
                var c = new Course(id, seq_no, index, salt);
                c.name = firsthref.text();
                return c;
            }

            // 通过课程获得HTML展示代码
            function ComposeCourseInfo(course) {
                var html = '<div class="course" id="$id"><span>$name</span><span>$max</span>/<span>$curr</span></div>'
                    .replace(/\$id/g, "dCourseInfo" + course.getHash())
                    .replace(/\$name/g, course.name)
                    .replace(/\$max/g, course.maxElectNum)
                    .replace(/\$curr/g, course.currElectNum);
                return $(html).click(function () {
                    $(".chkMonitor[data-coursehash=" + course.getHash() + "]").click();
                });
            }

            function AttachCourseRow(row, index) {
                var $this = row;
                var actionHref = $this.find("td:last-child a"), chkbox;
                if (actionHref.length == 0)
                    return null;
                var salt = "";
                if ($this.find("td").length >= 13)
                    salt = $this.find("td").eq(9).text();
                else
                    salt = $this.find("td").eq(8).text();
                var courseData = ArgParse($this.find("td:first a"), actionHref, index, salt);
                var numstrs = $this.find("[id^='electedNum']").text().split(" / ");
                courseData.currElectNum = parseInt(numstrs[1]);
                courseData.maxElectNum = parseInt(numstrs[0]);
                courseData.$tr = $this;
                courseData.save();
                if (!$this.find("td:last a").attr("id")) {
                    chkbox = "<input class='chkMonitor' type='checkbox' data-coursehash='" + courseData.getHash() + "' />";
                    $this.attr("name", "available");
                } else {
                    worked = true;
                    chkbox = "<input class='chkMonitor' type='checkbox' data-coursehash='" + courseData.getHash() + "' />";
                    $this.attr("name", "unavailable");
                }
                $this.append($("<td class='datagrid' align='center'></td>").append(chkbox));
                if (readCourseList().indexOf(courseData.getHash()) > -1) {
                    $(".chkMonitor[data-coursehash=" + courseData.getHash() + "]").click();
                }
                return $this;
            }

            if (true || worked) {  //temp disable the not working condition
                $("#validCode").closest("tr").find("td:gt(0)").remove();

                // 绑定事件响应程序
                eventHandler.electSuccess = function (course) {
                    controls.sStatus.removeClass().addClass("statustext-success").text("成功选课：" + course.name);
                    desktopNotify('success', '选课成功', '恭喜您！已经成功选上“' + course.name + '”', null);
                    course.$tr.find(".chkMonitor").click();
                    course.$tr.find(".chkMonitor").attr("disabled", "disabled");
                };
                eventHandler.electError = function (course, err) {
                    //不用刷新验证码
                    //document.getElementById('imgname').src = "http://elective.pku.edu.cn/elective2008/DrawServlet?Rand=" + Math.random();
                    controls.sStatus.removeClass().addClass("statustext-error").text("【请尽快填入验证码重试】试图选课“" + course.name + "”时遇到错误：" + err);
                    desktopNotify('error', '选课失败', "试图选课“" + course.name + "”时遇到错误：" + err, null);
                };
                var ctrlBar;
                var container;

                $.ajax({
                    url: chrome.extension.getURL('panel.html'),
                    async: false,
                    success: function (data) {
                        container = $(data);
                        $("body").append(container.hide());
                    }
                });

                // 底部的空间
                $('body').css({marginBottom: "180px"});

                var timInterval, countTime;

                var controls = {
                    txtInterval: null, validCode: null, imgname: null,
                    radFilterAll: null, radFilterAvailable: null,
                    radFilterUnAvailable: null, tglbtnAutoRefresh: null,
                    sStatus: null, btnCheckUpdate: null, navs: null, logo: null,
                    btnSoundConfig: null, menuSoundConfig: null,
                    btnTestSound: null, btnStopSound: null,
                    btnElectConfig: null, menuElectConfig: null, btnDummySubmit: null,
                    btnCaptchaConfig: null, menuCaptchaConfig: null,
                    dCourseList: null, limitTimesLabel: null, btnHide: null, disableMask: null,
                    panelBody: null
                };
                for (var i in controls)
                    controls[i] = container.find("#" + i);

                ctrlBar = controls.panelBody;

                // logo载入
                controls.logo.attr("src", chrome.extension.getURL('icons/icon_256.png'));

                eventHandler.detectCaptchaError = function () {
                    controls.imgname.click();
                }
                eventHandler.detectCaptchaSuccess = function () {
                }

                controls.imgname.attr("src", "http://elective.pku.edu.cn/elective2008/DrawServlet?Rand=" + Math.random())
                    .click(function () {
                        this.src = "http://elective.pku.edu.cn/elective2008/DrawServlet?Rand=" + Math.random();
                    }).css("cursor", "pointer");

                // 绑定事件及逻辑
                controls.radFilterAll.click(function () {
                    $("[name=available], [name=unavailable]").show();
                });
                controls.radFilterAvailable.click(function () {
                    $("[name=available]").show();
                    $("[name=unavailable]").hide();
                });
                controls.radFilterUnAvailable.click(function () {
                    $("[name=unavailable]").show();
                    $("[name=available]").hide();
                });
                controls.btnCheckUpdate.click(function () {
                    checkUpdate(true);
                });

                // 勾选复选框逻辑
                $(document).on('click', '.chkMonitor', function () {
                    var $this = $(this);
                    if (this.checked) {
                        $this.addClass("chk");
                        controls.dCourseList.append(
                            ComposeCourseInfo(Course.prototype.courses.get($this.data("coursehash")))
                        );
                        addToCourseList(Course.prototype.courses.get($this.data("coursehash")).getHash());
                    } else {
                        $this.removeClass("chk");
                        controls.dCourseList.find("#dCourseInfo" + $this.data("coursehash")).remove();
                        deleteFromCourseList($this.data("coursehash"));
                    }
                    controls.sStatus.removeClass().addClass("statustext-normal")
                        .text("监视中课程：" + $(".chk").length);
                });

                $("table.datagrid:eq(0) tr").each(function (i) {
                    var $this = $(this);
                    if (i == 0)
                        $this.append("<th class='datagrid'>监视</th>");
                    else
                        AttachCourseRow($this, i - 1);
                });

                $('#txtInterval').val(readTxtInterval());
                document.getElementById('txtInterval').onchange = function () {
                    writeTxtInterval($('#txtInterval').val());
                };

                // 选择操作按钮们
                controls.menuElectConfig.find("li").each(function () {
                    $(this).click(function () {
                        controls.btnElectConfig.attr("data-value", $(this).attr("data-value"));
                        controls.btnElectConfig.html($(this).children("a").html() + '<span class="caret"></span>');
                    });
                });

                // 验证码设置按钮们
                controls.btnCaptchaConfig.attr("data-value", readMenuCaptchaConfig());
                controls.menuCaptchaConfig.find("li").each(function () {
                    $(this).click(function () {
                        controls.btnCaptchaConfig.attr("data-value", $(this).attr("data-value"));
                        controls.btnCaptchaConfig.html($(this).children("a").html() + '<span class="caret"></span>');
                        writeMenuCaptchaConfig($(this).attr("data-value"));
                        switch ($(this).attr("data-value")) {
                            case '1':
                                document.getElementById('validCode').disabled = false;
                                eventHandler.detectCaptchaSuccess = function () {
                                };
                                document.getElementById('imgname').onload = function () {
                                };
                                document.getElementById('canv').style.display = 'none';
                                break;
                            case '2':
                                document.getElementById('validCode').disabled = true;
                                eventHandler.detectCaptchaSuccess = function () {
                                    validateDone = true;
                                };
                                document.getElementById('imgname').onload = detectCaptcha;
                                document.getElementById('canv').style.display = 'block';
                                break;
                            case '3':
                                document.getElementById('validCode').disabled = true;
                                eventHandler.detectCaptchaSuccess = function () {
                                    validateDone = true;
                                    controls.navs.children("li")[1].click();
                                    controls.tglbtnAutoRefresh.click();
                                };
                                document.getElementById('imgname').onload = detectCaptcha;
                                document.getElementById('canv').style.display = 'block';
                                $('imgname').click();
                                break;
                        }
                    });
                    if ($(this).attr("data-value") == readMenuCaptchaConfig()) {
                        $(this).click();
                    }
                });

                // 导航与分页的切换初始化
                controls.navs.children("li").each(function (i) {
                    $(this).click(function () {
                        if (!ctrlBar[0].checkValidity())
                            return controls.btnDummySubmit.click();

                        controls.navs.children("li").removeClass("active");
                        $(this).addClass("active");
                        ctrlBar.find(".panel-body").hide();
                        ctrlBar.find("#body" + i).show();
                        writeNavsConfig(i);
                    });
                    if (i == readNavsConfig()) {
                        $(this).click();
                    }
                });

                // 声音按钮们
                controls.menuSoundConfig.find("li").each(function () {
                    $(this).click(function () {
                        controls.btnSoundConfig.attr("data-value", $(this).attr("data-value"));
                        controls.btnSoundConfig.html($(this).children("a").html() + '<span class="caret"></span>');
                    });
                });
                controls.btnTestSound.click(function () {
                    playSound(controls.btnSoundConfig.attr("data-value") == "2");
                });
                controls.btnStopSound.click(function () {
                    stopSound();
                });

                //更新
                checkUpdate(false);

                //限额
                controls.limitTimesLabel.text("今日限额已使用 " + nowTimes + " / " + limitTimes + " 次");

                function RefreshAllAndNotify() {
                    // 刷新和比对逻辑

                    if (nowTimes < limitTimes) {
                        incNowTimes();
                    }
                    else {
                        controls.tglbtnAutoRefresh.click();
                        controls.sStatus.removeClass().addClass("statustext-normal").text("已停止自动刷新，达到当日限额。");
                        return;
                    }
                    //限额
                    controls.limitTimesLabel.text("今日限额已使用 " + nowTimes + " / " + limitTimes + " 次");


                    controls.sStatus.removeClass().addClass("statustext-normal").text("刷新中……");
                    var watingForElect = [];
                    LoadCourses(currID, false, function (courserows) {
                        if (!courserows) {
                            countTime = parseInt(controls.txtInterval.val()) * 1000;
                            timInterval = setInterval(countDown, 300, '上次刷新失败');
                            return;
                        }
                        var hasElected = false;
                        courserows.each(function (index) {
                            var $this = $(this);
                            var wasAvailable = $this.attr("name") == "available";

                            // 更新旧信息
                            var actionHref = $this.find("td:last-child a");
                            if (actionHref.length == 0)
                                return null;
                            var salt = "";
                            if ($this.find("td").length >= 13)
                                salt = $this.find("td").eq(9).text();
                            else
                                salt = $this.find("td").eq(8).text();
                            var courseData = ArgParse($this.find("td:first a"), actionHref, index, salt), lastData;
                            lastData = Course.prototype.courses.get(courseData.getHash());
                            if (!lastData) {
                                $("table.datagrid:eq(0)").append(
                                    AttachCourseRow($this, index)
                                );
                                lastData = Course.prototype.courses.get(courseData.getHash());
                            } else {
                                var numstrs = $this.find("[id^='electedNum']").text().split(" / ");
                                lastData.currElectNum = parseInt(numstrs[1]);
                                lastData.maxElectNum = parseInt(numstrs[0]);
                                lastData.index = courseData.index;

                                // 更新链接和表格行
                                var oldtds = lastData.$tr.find("td"),
                                    newtds = $this.find("td");
                                for (var i = 0; i < newtds.length; i++)
                                    oldtds.eq(i).replaceWith(newtds.eq(i));
                            }


                            if (!wasAvailable && lastData.currElectNum < lastData.maxElectNum
                                && lastData.$tr.find(".chkMonitor")[0].checked == true) {
                                lastData.$tr.css({backgroundColor: "#ee6666"});
                                watingForElect.push(lastData);
                                hasElected = true;
                            }
                        });
                        countTime = parseInt(controls.txtInterval.val()) * 1000;
                        if (!hasElected) {
                            controls.sStatus.removeClass().addClass("statustext-normal")
                                .text("刷新结束，无变化，" + countTime / 1000 + ".0秒后再试");
                        } else {
                            var sndConf = controls.btnSoundConfig.attr("data-value");
                            if (sndConf != 0)
                                playSound(sndConf == "2");
                            //是时候开始真正的选课了
                            var course = watingForElect.pop();
                            while (course) {
                                if (controls.btnElectConfig.attr("data-value") == 2) {
                                    controls.sStatus.removeClass().addClass("statustext-normal").text("发现可选课程“" + course.name + "”，选课中……");
                                    desktopNotify('warning', '可选课程提示', '您关注的课程“' + course.name + '”已经有空位了！正在自动选课……', null);
                                    course.elect();
                                }
                                else {
                                    controls.sStatus.removeClass().addClass("statustext-normal").text("发现可选课程“" + course.name + "”，请选课。");
                                    desktopNotify('warning', '可选课程提示', '您关注的课程“' + course.name + '”已经有空位了！请选课……', null);
                                    course.$tr.find(".chkMonitor").click();
                                }
                                course = watingForElect.pop();
                            }
                        }
                        timInterval = setInterval(countDown, 300, '刷新结束');
                    });
                }

                //倒计时
                function countDown(text) {
                    if (!controls.tglbtnAutoRefresh.data("active"))
                        return;
                    if (countTime <= 300) {
                        clearInterval(timInterval);
                        RefreshAllAndNotify();
                    }
                    else {
                        countTime -= 300;
                        controls.sStatus.text(text + "，" + Math.floor(countTime / 1000) + '.' + Math.floor(countTime / 100) % 10 + "秒后再试");
                    }
                }

                ctrlBar.submit(function (e) {
                    e.preventDefault();
                });

                controls.tglbtnAutoRefresh.click(function () {
                    if (!ctrlBar[0].checkValidity())
                        return controls.btnDummySubmit.click();

                    $this = controls.tglbtnAutoRefresh;
                    if ($this.data("active")) {
                        clearInterval(timInterval);
                        $this.data("active", false);
                        $this.removeClass("btn-danger").addClass("btn-success").text("启用自动刷新");
                        controls.sStatus.removeClass().addClass("statustext-normal").text("已停止自动刷新");
                    } else {
                        eventHandler.validatePass = function () {
                            validateDone = true;
                            if ($this.data("active"))
                                RefreshAllAndNotify();
                        };
                        eventHandler.validateNotPass = function (message) {
                            validateDone = false;
                            $this.data("active", false);
                            $this.removeClass("btn-danger").addClass("btn-success").text("启用自动刷新");
                            controls.sStatus.removeClass().addClass("statustext-error").text(message);
                        };
                        // 先进行验证码验证
                        if (controls.btnCaptchaConfig.attr("data-value") == '1') {
                            $this.data("active", true);
                            $this.removeClass("btn-success").addClass("btn-danger").text("停止自动刷新");
                            controls.sStatus.removeClass().addClass("statustext-normal").text("正在验证验证码...");
                            if (validateDone)
                                eventHandler.validatePass();
                            else
                                validate(controls.validCode.val());
                        } else {
                            if (validateDone) {
                                $this.data("active", true);
                                $this.removeClass("btn-success").addClass("btn-danger").text("停止自动刷新");
                                eventHandler.validatePass();
                            } else
                                controls.sStatus.removeClass().addClass("statustext-normal").text("请等待自动验证码完成...");

                        }
                    }
                });
                controls.sStatus.removeClass().addClass("statustext-normal").text("就绪。尚未监视课程，请勾选相应复选框");

                controls.btnHide.click(function () {
                    if ($(this).data("hide")) {
                        $(this).text("隐藏助手");
                        ctrlBar.slideDown();
                        $(this).data("hide", false);
                    }
                    else {
                        $(this).text("显示助手");
                        ctrlBar.slideUp();
                        $(this).data("hide", true);
                    }
                });

                if (document.documentElement.outerHTML.indexOf("目前不是补退选时间") < 0) {
                    controls.disableMask.hide();
                }

                container.slideDown();
            }
        }
    });
})(jQuery);
