// ==UserScript==
// @name        HLJU Class Schedule
// @namespace   https://fuyuhin.me
// @description Export your classes to a ics file.
// @include     http://*.hlju.edu.cn/xsxk/index.xk
// @version     0.1
// @grant       none
// ==/UserScript==
function get_first_week_num(week_sequence){
    return week_sequence.indexOf('1') + 1;
}

function get_last_week_num(week_sequence){
    return week_sequence.lastIndexOf('1') + 1;
}

function date_to_ics_format_string(date) {
    var s = '';
    s = s + date.getFullYear(); 
    var month = date.getMonth() + 1;
    if (month > 9) { 
        s = s + month.toString();
    }
    else{
        s = s + '0' + month.toString();
    }
    var d = date.getDate();
    if (d > 9) {
        s = s + d.toString();
    }
    else{
        s = s + '0' + d.toString();
    }
    s = s + 'T';
    var hour = date.getHours();
    if (hour > 9) {
        s = s + hour.toString();
    }
    else{
        s = s + '0' + hour.toString();
    }
    var minute = date.getMinutes();
    if (minute > 9) {
        s = s + minute.toString();
    }
    else{
        s = s + '0' + minute.toString();
    }
    s = s + '00';
    return s;
}

function get_repead_rule(week_sequence, weekday, until_date)
{
    var week_array = new Array();
    for (var i = 0; i < week_sequence.length; i++) {
        if (week_sequence[i] == '1'){
            week_array.push(i + 1);
        }
    }
    var interval;
    if (week_array[week_array.length - 1] - week_array[0] == week_array.length - 1) {
        interval = '1';
    }
    else{
        interval = '2';
    }
    var byday;
    switch(weekday){
        case '1': byday = 'MO'; break;
        case '2': byday = 'TU'; break;
        case '3': byday = 'WE'; break;
        case '4': byday = 'TH'; break;
        case '5': byday = 'FR'; break;
        case '6': byday = 'SA'; break;
        case '7': byday = 'SU'; break;
    };
    var until = date_to_ics_format_string(until_date);
    return 'RRULE:FREQ=WEEKLY;UNTIL=' + until + 'Z;INTERVAL=' + interval + ';BYDAY=' + byday + ';WKST=SU';
}

function lesson_start_time(begin_session){
    switch (begin_session){
        case '1': return 0800;
        case '2': return 0900;
        case '3': return 1020;
        case '4': return 1120;
        case '5': return 1330;
        case '6': return 1430;
        case '7': return 1540;
        case '8': return 1640;
        case '9': return 1830;
        case '10': return 1925;
        case '11': return 2020;
    }
}

function lesson_end_time(begin_session){
    switch (begin_session){ 
        case '1': return 0850;
        case '2': return 0950;
        case '3': return 1110;
        case '4': return 1210;
        case '5': return 1420;
        case '6': return 1520;
        case '7': return 1630;
        case '8': return 1730;
        case '9': return 1920;
        case '10': return 2015;
        case '11': return 2110;
    }
}

function fuck(week_fuck, weekday_fuck)
{
    var a = 0;
    var b = 0;
    var c = 0;
    var d = 0;
    a = week_fuck - 1;
    b = a * 7;
    c = b + weekday_fuck;
    d = c - 1;
    return d;
}

function get_date(week, weekday, time){
    var first_monday = new Date("2016-08-22");
    var days = 0;
    days = fuck(week, parseInt(weekday));
    first_monday.setDate(first_monday.getDate() + days);
    first_monday.setHours(parseInt(time / 100));
    first_monday.setMinutes(parseInt(time % 100));
    first_monday.setSeconds(0);
    return first_monday;
}

function Event(class_info){
    this.uid = class_info.jxbid;
    this.summary = class_info.kcm;
    this.teacher = class_info.skjs;
    this.print = function () {
        var ics_vevent = '';
        var lessons = class_info.pkxxList;
        for (var i in lessons) {
            var event_begin = 'BEGIN:VEVENT\n';
            var event_end = 'END:VEVENT\n';
            var dt_start = get_date(get_first_week_num(lessons[i].zcbh), 
                                    parseInt(lessons[i].skxq), 
                                    lesson_start_time(lessons[i].ksjc));
            var dt_end = get_date(get_first_week_num(lessons[i].zcbh), 
                                  parseInt(lessons[i].skxq), 
                                  lesson_end_time(lessons[i].jsjc));
            ics_vevent = ics_vevent + event_begin + 
                    'DTSTART;TZID=Asia/Shanghai:' + date_to_ics_format_string(dt_start) + '\n' +
                    'DTEND;TZID=Asia/Shanghai:' + date_to_ics_format_string(dt_end) + '\n' +
                    get_repead_rule(lessons[i].zcbh, lessons[i].skxq, 
                        get_date(get_last_week_num(lessons[i].zcbh), 
                            parseInt(lessons[i].skxq), 
                            lesson_end_time(lessons[i].jsjc))) + '\n' +
                    'DTSTAMP:20160822T125937Z\n' + 
                    'UID:' + this.uid + i.toString() + '\n' +
                    'LOCATION:' + lessons[i].jsmc + '\n' + 
                    'DESCRIPTION:' + lessons[i].zcmc + '\n' + 
                    'SEQUENCE:0\n' + 
                    'STATUS:CONFIRMED\n' + 
                    'SUMMARY:' + this.summary + ' ' + this.teacher + '\n' +
                    'TRANSP:OPAQUE\n' + 
                    event_end;
        }
        return ics_vevent;
    }
}

var ics_vevents = '';
for (var key in yxJxbList){
    if (yxJxbList[key].pkxxList[0].jsmc !== '') {
        var event = new Event(yxJxbList[key]);
        ics_vevents = ics_vevents + event.print();
    }
}
var event_begin = 'BEGIN:VCALENDAR\nPRODID:Fuyuhin.me\nVERSION:2.0\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:HLJU Class Schedule\nX-WR-TIMEZONE:Asia/Shanghai\nBEGIN:VTIMEZONE\nTZID:Asia/Shanghai\nX-LIC-LOCATION:Asia/Shanghai\nBEGIN:STANDARD\nTZOFFSETFROM:+0800\nTZOFFSETTO:+0800\nTZNAME:CST\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE\n';
var event_end = 'END:VCALENDAR';
var ics_content = event_begin + ics_vevents + event_end;
// console.log(ics_content);
alert(ics_content);