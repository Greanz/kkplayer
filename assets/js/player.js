/**
 * @Author: Owen Kalungwe
 * @Version 1.0.1
 * Simple player kkPlay Music
 * 12-01-2021
 *
 */
(function (window) {
    let player;
    function kkPlay(){
        let kkPlay = {};

        kkPlay.version      = '1.0.0';
        kkPlay.htmlPlayer   =  document.createElement("audio");
        kkPlay.autoPlay     = false;
        kkPlay.source       = '';
        kkPlay.seekOnMouseMove=false;
        kkPlay.preload      = false;
        kkPlay.thumbnail    = '';
        kkPlay.enableVisualize= false;
        kkPlay.trackIdentifier = '';
        kkPlay.repeat  = false;

        kkPlay.play = function(){
            kkPlay.htmlPlayer.play().then(function (result) {
                $("#kkPlayer").find('.play').find("i").removeClass('zmdi-play-circle-outline').
                addClass('zmdi-pause-circle-outline');
                let trackId = $(kkPlay.htmlPlayer).attr("trackID");
                if(trackId !== undefined){
                    if(trackId!=="") {
                        kkPlay.fetchServer({'trackId': trackId}, 'tracker.php').then(function (res) {
                            console.log(res);
                            $(kkPlay.htmlPlayer).attr("trackID", "");
                            $(".kkIsPlayingHere").attr('data-trackID', '');
                        }, function (err) {
                            console.log(err);
                        });
                    }
                }
            },function (error) {
                console.log("No proper sound file to play");
            });
        };

        kkPlay.pause = function (){
            kkPlay.htmlPlayer.pause();
        };

        kkPlay.has = function(str,has){
            let pattern = new RegExp(has);
            return pattern.test(str) === true;
        };

        kkPlay.toDuration = function(time){
            let myTime = String(time);
            if(this.has(myTime,'.')){
                myTime = myTime.toString().replace('.',':');
            }
            else{
                if(myTime.toString().length===1) {
                    myTime = myTime.toString() + ':00';
                }
            }
            myTime = myTime.split(":");
            myTime[0] = typeof myTime[0] === "undefined" ? myTime[0]='00' : myTime[0];
            myTime[1] = typeof myTime[1] === "undefined" ? myTime[1]='00' : myTime[1];
            if(myTime[0].length !== 2) myTime[0] = '0'+myTime[0];
            if(myTime[1].length !== 2) myTime[1] = '0' + myTime[1];
            return myTime[0]+':'+myTime[1];
        };

        kkPlay.player = function (element){
            let template = '<div id="kkPlayer">' +
                '<div class="play"><span title="P to play"><i class="zmdi zmdi-play-circle-outline"></i></span></div>' +
                '<div class="last_duration">00:00</div>'+
                '<div class="seeker"><span><i></i></span></div>'+
                '<div class="total_duration">00:00</div>'+
                '<div class="player_mute" title="M to mute"><span><i class="zmdi zmdi-volume-up"></i></span></div>' +
                '<div class="progress_volume" title="+ and - to change volume">' +
                '<span data-volume="0.1" class="v-active"></span>' +
                '<span data-volume="0.4" class=""></span>' +
                '<span data-volume="0.6" class=""></span>' +
                '<span data-volume="0.8" class=""></span>' +
                '<span data-volume="1.0" class=""></span>' +
                '</div>' +
                '<div class="visual"></div>'+
                '</div>';
            var parent = document.querySelectorAll(element);
            if(parent.length !== 1) return alert(element + " is not available");
            $(element).append(template).after(function () {
                kkPlay.resize();
                $(window).resize(function () {
                    kkPlay.resize();
                }).on('keydown', function(event) {
                    //console.log(event.keyCode);
                    if (event.keyCode===32 || event.keyCode===80) return $('.play').trigger("click");
                    if (event.keyCode===77) return $('.player_mute').trigger("click");
                    if (event.keyCode===61 || event.keyCode===173){
                        if (event.keyCode===61) return $("span.v-active").next().trigger("click");
                        if (event.keyCode===173) return $("span.v-active").prev().trigger("click");
                    }
                });
                kkPlay.htmlPlayer.setAttribute('controls','controls');
                kkPlay.htmlPlayer.style.display='none';
                let preload = kkPlay.preload ? '':'none';
                kkPlay.htmlPlayer.setAttribute('preload',preload);
                let source = $(element).attr("data-src");
                if(typeof source !=="undefined"){
                    if(source !==""){
                        kkPlay.source =source;
                    }
                }
                if(kkPlay.source!==""){
                    kkPlay.htmlPlayer.setAttribute('src',kkPlay.source);
                }
                if(kkPlay.autoPlay){
                    kkPlay.play();
                }
                $(element).addClass("kkIsPlayingHere");
                let trackId = $(element).attr("data-trackId");
                if(typeof  trackId != "undefined"){
                    if(trackId !== ""){
                        kkPlay.htmlPlayer.setAttribute('trackID',trackId);
                    }
                }
                if(kkPlay.trackIdentifier !==""){
                    kkPlay.htmlPlayer.setAttribute('trackID',kkPlay.trackIdentifier);
                }
                kkPlay.htmlPlayer.ontimeupdate = function(){
                    let now = this.currentTime / this.duration * 100;
                    if(now>99){
                        now=100;
                        $("#kkPlayer").find('.play').find("i").removeClass('zmdi-pause-circle-outline').
                        addClass('zmdi-play-circle-outline');
                        if(kkPlay.repeat)kkPlay.play();
                    }
                    let duration = kkPlay.toDuration(Math.floor((this.duration * 100)/60)/100);
                    let current = kkPlay.toDuration(Math.floor((this.currentTime * 100)/60)/100);
                    $("#kkPlayer").after(function () {
                        $(this).find('.last_duration').html(current);
                        $(this).find('.total_duration').html(duration);
                        $(this).find('.seeker').find('i').css({'width':now+'%'});
                    });
                    kkPlay.visualize();
                };
                $(this).attr("tabindex","0").append(kkPlay.htmlPlayer).after(function () {
                    if(kkPlay.source!=="" && kkPlay.preload){
                        setTimeout(function () {
                            let duration = kkPlay.toDuration(Math.floor((
                                kkPlay.htmlPlayer.duration * 100
                            )/60)/100);
                            $("#kkPlayer").find('.total_duration').html(duration);
                        },500);
                    }
                    $("#kkPlayer").css({
                        'background': kkPlay.thumbnail === '' ? '':"#191919 url('"+kkPlay.thumbnail+"') no-repeat",
                        'background-size': "cover",
                        'background-position': "top"
                    });
                });
                $(this).on("click",function (e) {
                    if($(e.target).closest('.player_mute').length){
                        if($(e.target).closest('.player_mute').find("i").hasClass('zmdi-volume-up')){
                            $(e.target).closest('.player_mute').find("i").removeClass('zmdi-volume-up').
                            addClass('zmdi-volume-off');
                            kkPlay.htmlPlayer.muted = true;
                        }
                        else{
                            $(e.target).closest('.player_mute').find("i").removeClass('zmdi-volume-off').
                            addClass('zmdi-volume-up');
                            kkPlay.htmlPlayer.muted = false;
                        }
                        if($(e.target).closest('.player_mute .zmdi-volume-up').length){
                            $("#kkPlayer").find(".progress_volume span").css({'visibility':'visible'});
                        }
                        else{
                            $("#kkPlayer").find(".progress_volume span").css({'visibility':'hidden'});
                        }
                    }
                    if($(e.target).closest('.play').length){
                        if($(e.target).closest('.play').find("i").hasClass('zmdi-play-circle-outline')){
                            kkPlay.play();
                        }
                        else{
                            $(e.target).closest('.play').find("i").removeClass('zmdi-pause-circle-outline').
                            addClass('zmdi-play-circle-outline');
                            kkPlay.htmlPlayer.pause();
                        }
                    }
                    if($(e.target).closest('.progress_volume').length){
                        let vSpan = $(e.target).closest('span');
                        if(vSpan.length>0) {
                            let volume = +$(vSpan).attr('data-volume');
                            $(e.target).closest('.progress_volume').find("span").removeClass('v-active').after(
                                function () {
                                    let v2 = +$(this).attr('data-volume');
                                    if(v2 <= volume){
                                        $(this).addClass('v-active')
                                    }
                                }
                            );
                            kkPlay.htmlPlayer.volume = volume;
                        }
                    }
                    if($(e.target).closest('.seeker').length){
                        kkPlay.seek(e);
                    }
                }).on("mousemove",function (e) {
                    if($(e.target).closest('.seeker span').length && kkPlay.seekOnMouseMove){
                        e.preventDefault();
                        let width   = $(e.target).closest('.seeker').width();
                        let percent = (e.offsetX*100) / width;
                        if(percent  > 100) percent = 100;
                        let seeker  = $(e.target).closest('.seeker').find('i');
                        $(seeker).width(percent+'%');
                    }
                }).on("mouseout",function (e) {
                    if($(e.target).closest('.seeker span').length && kkPlay.seekOnMouseMove){
                        kkPlay.seek(e);
                    }
                }).on("drop",function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    let files = e.originalEvent.target.files || e.originalEvent.dataTransfer.files;
                    let file = files[0];
                    let fileReader = new FileReader();
                    fileReader.onload = (function(file) {
                        return function(event) {
                            let filename = file.name;
                            let mp3 = event.target.result;
                            kkPlay.playFile(mp3);
                        };
                    })(file);
                    return fileReader.readAsDataURL(file);
                }).on("dragleave",function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }).on("dragover",function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });
        };

        kkPlay.seek = function (e) {
            let seeker = $(e.target).closest('.seeker').find('span');
            let offset = $(seeker).offset();
            let totalWidth = $(seeker).outerWidth();
            let left = e.pageX - offset.left;
            let totalDuration = kkPlay.htmlPlayer.duration;
            let currentPosition = (left * totalDuration) / totalWidth;
            if(!isFinite(currentPosition)) return;
            kkPlay.htmlPlayer.currentTime = currentPosition;
        };

        kkPlay.resize = function (){
            let myDiv = $("#kkPlayer").find("div");
            let seekerDiv = $("#kkPlayer").find("div.seeker");
            let playSpan  = $("#kkPlayer").find(".play span, .player_mute span");
            let playVolume  = $("#kkPlayer").find(".progress_volume");
            let width = $(myDiv).width();
            let height = $(myDiv).height();

            let halfWidth = width / 2;
            let halfHeight = height / 2;

            $(playSpan).css({
                'height':halfHeight+'px',
                'width':halfWidth+'px',
                'margin-left':halfWidth/2+'px',
                'margin-top':halfHeight/2+'px',
                'line-height':halfHeight/2+'px'
            }).after(function () {
                $(this).find("i").css({
                    'font-size':'50px',
                });
            });

            if(window.innerWidth <= 600){
                $(playSpan).css({
                    'margin-top':(halfHeight-12)+'px',
                }).after(function () {
                    $(this).find("i").css({
                        'font-size':'30px',
                    });
                });
            }

            $(seekerDiv).find('span').css({
                'margin-top':(halfHeight-4)+'px'
            });

            $(playVolume).find('span').css({
                'margin-top':(halfHeight-7)+'px'
            });

            let width2 = $("#kkPlayer").width() / 2;
            let marginLeft = width2 / 2;
            $("#kkPlayer").find(".visual").css({
                'width':width2+'px',
                'margin-left':marginLeft+'px'
            });
        };

        kkPlay.visualize = function (){
            let c = 0;
            $("#kkPlayer").find(".visual").empty();
            if(kkPlay.enableVisualize) {
                while (true) {
                    let height = String(kkPlay.randomInteger(0, 100)) + '%';
                    let i = document.createElement("i");
                    i.style.height = height;
                    i.setAttribute('data-height', height);
                    $("#kkPlayer").find(".visual").append(i);
                    if (c++ === 99) break;
                }
            }
        };

        kkPlay.randomInteger = function (min=0, max=100) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        kkPlay.fetchServer = async function (headers,path="ajax.php",json=true) {
            let j = {};
            for(let i in headers){
                j[i] = headers[i];
            }
            j = kkPlay.jsonString(j);
            return $.ajax({
                url: path,
                type: 'POST',
                data: "data=" + j
            }).then(function (data) {
                if(json) data = kkPlay.toJson(data);
                return data
            },function (error) {
                let res = '{"msg":"Communication error","type":"danger"}';
                if(json) res = kkPlay.toJson(data);
                return res
            });
        };

        kkPlay.jsonString = function (String){
            return JSON.stringify(String);
        };

        kkPlay.toJson = function (String){
            return $.parseJSON(String);
        };

        kkPlay.setThumbnail = function(path){
            return $("#kkPlayer").css({
                'background': "#191919 url('"+path+"')  no-repeat",
                'background-size': "cover",
                'background-position': "top"
            });
        };

        kkPlay.startVisualEffects = function(){
            return kkPlay.enableVisualize = true;
        };

        kkPlay.disableVisualEffects = function(){
            return kkPlay.enableVisualize = false;
        };

        kkPlay.newTrackId = function(id){
            return $(kkPlay.htmlPlayer).attr('trackID',id);
        };

        kkPlay.playFile = function(path){
            kkPlay.htmlPlayer.setAttribute("src",path);
            kkPlay.htmlPlayer.play();
        };

        kkPlay.enableRepeat = function(){
           if(!kkPlay.repeat)return kkPlay.repeat = true;
           return kkPlay.repeat = false;
        };

        return kkPlay;
    }

    if(typeof(window.player) === 'undefined'){
        window.player = kkPlay();
    }

})(window);