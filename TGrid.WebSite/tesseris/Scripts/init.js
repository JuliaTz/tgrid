﻿$(function () {
    $('#left').height($('#content').height());
    var left = ($('#wrapper').width() - $('#content').width()) / 2 - $('#left').width();
    $('left').css({ "left": "left" });
    $('#right').height($('#content').height());
    $('right').css({ "right": "left" });
    //$('#top').width($('#wrapper').width());
    $('#bottom').width($('#wrapper').width());    
})