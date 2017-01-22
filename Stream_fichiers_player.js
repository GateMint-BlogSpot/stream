function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function getParameterByName(url, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function detectType(src) {
    if (src.indexOf('<') != -1 && src.indexOf('>') != -1) {
        return 'html';
    } else if (src.indexOf('rtmp') != -1) {
        return 'rtmp';
    } else if (src.indexOf('.m3u8') != -1) {
        return 'hls';
    } else if (src.indexOf('.f4m') != -1) {
        return 'hds';
    } else if (src.indexOf('embed') != -1) {
        return 'iframe';
    } else {
        return 'http';
    }
}

function showTip(msg) {
    $('#player-tip').html(msg).show();
}

function playStream(type, src) {
    $('#player-tip').hide();
    if (type == 'auto') {
        type = detectType(src);
    }
    switch (type) {
        case 'hds':
            src = src + '#.f4m';
        case 'rtmp':
        case 'http':
            if (isMobile()) {
                showTip('Sorry, Adobe Flash Player is required for this stream.');
            } else {
                playByFlash(src);
            }
            break;
        case 'hls':
            src = src;
            playHLS(src);
            break;
        case 'iframe':
            playIFRAME(src);
            break;
        case 'html':
            playHTML(src);
            break;
    }
}

function playHTML(html) {
    $('#player').replaceWith(html);
    $('#player').css('visibility', 'visible');
}

function playIFRAME(src) {
    var width = $('#player').width();
    var height = $('#player').height();
    src = src.replace("{width}", width);
    src = src.replace("{height}", height);
    var html = '<iframe id="player" allowfullscreen="true" frameborder="0" scrolling="no" src="' +
        src + '">';
    $('#player').replaceWith(html);
    $('#player').css('visibility', 'visible');
}

function playByFlash(src) {
    var scaleMode = getParameterByName(src, 'scaleMode') || 'letterbox';
    var flashvars = {
        src: escape(src),
        scaleMode: scaleMode,
        autoPlay: true,
    };
    var params = {
        allowFullScreen: 'true',
        allowScriptAccess: 'always',
        wmode: 'opaque'
    };
    var attributes = {
        id: 'player'
    };
    swfobject.embedSWF(window.root + '/player/GrindPlayer.swf', 'player', '640', '480', '10.2', null, flashvars, params, attributes);
}

function playHLS(src) {
    if (isMobile()) {
        var html = '<video id="player" controls autoplay>';
        html += '<source src="' + src + '" type="application/x-mpegurl">'
        html += '<source src="' + src + '" type="video/mp4">'
        html += '</video>';
        playHTML(html);
    } else {
        if (src.indexOf('videojs') != -1) {
            playHLSByVideoJS(src);
        } else {
            playHLSByGrindPlayer(src);
        }
    }
}

function playHLSByVideoJS(src) {
    var link = document.createElement('link');
    link.href = window.root + '/player/videojs/video-js.css';
    link.rel = 'stylesheet';
    document.body.appendChild(link);
    var script = document.createElement('script');
    script.src = '/player/videojs/videojs.bundle.js';
    script.onload = function() {
        var attributes = {
            'id': 'player',
            'class': 'video-js vjs-default-skin',
            'width': 'auto',
            'height': 'auto',
            'controls': ' ',
            'autoplay': '',
            'preload': 'auto',
            'data-setup': '{}'
        }
        var element = $('<video><source type="application/x-mpegURL" src="' + src +
            '"></source></video>').attr(attributes)
        $("#player").replaceWith(element);
        videojs("#player", {}, function() {});
    };
    document.body.appendChild(script);
}

function playHLSByGrindPlayer(src) {
    var scaleMode = getParameterByName(src, 'scaleMode') || 'letterbox';
    var flashvars = {
        autoPlay: 'true',
        src: escape(src),
        streamType: 'live',
        scaleMode: scaleMode,
        plugin_hls: window.root + '/player/flashlsOSMF.swf',
        hls_debug: false,
        hls_debug2: false,
        hls_minbufferlength: -1,
        hls_lowbufferlength: 4,
        hls_maxbufferlength: 30,
        hls_startfromlowestlevel: false,
        hls_seekfromlowestlevel: false,
        hls_live_flushurlcache: false,
        hls_seekmode: 'ACCURATE',
        hls_capleveltostage: false,
        hls_maxlevelcappingmode: 'downscale'
    };
    var params = {
        allowFullScreen: 'true',
        allowScriptAccess: 'always',
        wmode: 'opaque'
    };
    var attributes = {
        id: 'player'
    };
    swfobject.registerObject("player", "10.2", "expressInstall.swf");
    swfobject.embedSWF(window.root + '/player/GrindPlayer.swf', 'player', '640', '480', '10.2', null, flashvars, params, attributes);
}
