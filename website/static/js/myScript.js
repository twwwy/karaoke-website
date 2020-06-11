
String.prototype.format = function() {
a = this;
for (k in arguments) {
a = a.replace("{" + k + "}", arguments[k])
}
return a
}

// Trigger search and render result: an AJAX that posts to /search_result and render results

function search_trigger() {
    //console.log('Searching ' + $('#searchText').val())
    var wrapper = document.getElementById('result')
    var myHTML = 'searching ' + '"' + $('#searchText').val() + '"';
    wrapper.innerHTML = "<span>{0}...</span>".format(myHTML)

    $.post('/search_result', {
        'search_text': $('#searchText').val()
    })
    .done(function(data){
        json = JSON.parse(data);
        //console.log(json = json)
        var myHTML = '';

        for (const entry of json.videos){
            myHTML += "<li class='result list-group-item' link={0} video_id={1}>{2}</li>".format(
                entry['link'], entry['id'], entry['title']
            );
        }
        wrapper.innerHTML = myHTML;
    })
}

// click on search result and add to queue
$(function () {
    $('div.result').on('click', "li", function(){
        //console.log(a = $(this));
        var myHTML = "<li class='queue list-group-item' link={0} video_id={1} status='queue' k_ready='false'>{2}</li>".format(
                    $(this).attr('link'), $(this).attr('video_id'), $(this).text()
        );
        $('#ol_queue').append(myHTML)
        if (sessionStorage.getItem($(this).attr('video_id')) == null){
            // download_audio($(this))

            let _video_id = $(this).attr('video_id')
            $.post('/tasks',{
                'url': $('li.queue[video_id='+_video_id+']').attr('link'),
                '_video_id': _video_id
            }).done(function (r) {
                console.log(r)
                getStatus(r.data.task_id)
            })
        } else {
            console.log('no need to download')

            let _video_id = $(this).attr('video_id')
            // console.log(_video_id)
            // console.log($("li.queue[video_id ="+_video_id+"]"))
            $("li.queue[video_id ="+_video_id+"]").addClass('list-group-item-success')
            let url = sessionStorage.getItem($(this).attr('video_id'));
            // console.log(url)
            $("li.queue[video_id ="+_video_id+"]").attr('k_ready', url)
        }
    });
})

// click on history and add to queue
$(function () {
    $('div.history').on('click', "li", function(){
        //console.log(a = $(this));
        var myHTML = "<li class='queue list-group-item' link={0} video_id={1} status='queue' k_ready='false'>{2}</li>".format(
                    $(this).attr('link'), $(this).attr('video_id'), $(this).text()
        );
        $('#ol_queue').append(myHTML)
        if (sessionStorage.getItem($(this).attr('video_id')) == null){
            // download_audio($(this))

            let _video_id = $(this).attr('video_id')
            $.post('/tasks',{
                'url': $('li.queue[video_id='+_video_id+']').attr('link'),
                '_video_id': _video_id
            }).done(function (r) {
                console.log(r)
                getStatus(r.data.task_id)
            })
        } else {
            console.log('no need to download')

            let _video_id = $(this).attr('video_id')
            // console.log(_video_id)
            // console.log($("li.queue[video_id ="+_video_id+"]"))

            $("li.queue[video_id ="+_video_id+"]").addClass('list-group-item-success')
            // $("li.queue[video_id ="+_video_id+"]").css("background-color", "#56FF1A")
            let url = sessionStorage.getItem($(this).attr('video_id'));
            // console.log(url)
            $("li.queue[video_id ="+_video_id+"]").attr('k_ready', url)
        }
    });
})



// clear queue
function clear_queue() {
    $("#ol_queue").empty()
}

//start playing button
function start_playing(){
    loadVideo()
    load_audio()
    playVideo()
}

function load_audio(){
    $('audio #source').attr('src', $("li.queue").first().attr('k_ready'));
    $('audio').get(0).load();
}

function play_audio(video_time){
    $('audio').get(0).currentTime = video_time
    $('audio').get(0).play()
}

function toggle_audio_mute(){
    if ($('audio').get(0).volume == 0){
        $('audio').get(0).volume = 1
    } else if ($('audio').get(0).volume == 1){
        $('audio').get(0).volume = 0
    }
}

function stop_audio(){
    $('audio').get(0).pause()
}

function get_diff(){
    getVideoCurrentTime() - $('audio').get(0).currentTime
}

function sync_audio(diff){

    // console.log('')
    // difference0 = getVideoCurrentTime() - $('audio').get(0).currentTime

    // setTimeout(difference0 = getVideoCurrentTime() - $('audio').get(0).currentTime
    //     ,5000)
    // getVideoCurrentTime() - $('audio').get(0).currentTime
    // setTimeout($('audio').get(0).currentTime = getVideoCurrentTime()
    //     ,500)
    // diff = getVideoCurrentTime() - $('audio').get(0).currentTime
    console.log('pre difference: ' + diff)
    $('audio').get(0).currentTime = getVideoCurrentTime() + diff

    // setTimeout($('audio').get(0).currentTime = getVideoCurrentTime() +
    //     ,500)
    // console.log('pre difference: ' + difference0)
    // $('audio').get(0).currentTime = getVideoCurrentTime() + difference0

    // difference1 = getVideoCurrentTime() - $('audio').get(0).currentTime
    // console.log('post difference: ' + difference1)
    // $('audio').get(0).currentTime = getVideoCurrentTime() + difference0
    // difference2 = getVideoCurrentTime() - $('audio').get(0).currentTime
    // console.log('final difference: ' + difference2)
}

// next song: move first song in queue to history, and loadVideo, and load accompany
function next_song() {
    if ($('li.queue').length > 1){
        move_to_history()
        loadVideo()
        load_audio()
    }
};
// a helper function that move played song to history
function move_to_history() {
    $('li.queue').first().attr({'class': 'history list-group-item list-group-item-success', 'status': 'played'})
    // movedlist = $('li.history').first()
    // console.log(a = movedlist)
    $('ol.history').append($('ol.queue li').first())
}

function getStatus(taskID){
    $.get('/tasks/'+taskID
    ).done(function (r) {
        // console.log(a=r)
        const taskStatus = r.data.task_status;
        if (taskStatus === 'finished'){
            // console.log(r)
            $('li.queue[video_id='+r.data.task_result._video_id+']').addClass('list-group-item-success')
            $('li.queue[video_id='+r.data.task_result._video_id+']').attr('k_ready', r.data.task_result.url)
            sessionStorage.setItem(r.data.task_result._video_id, r.data.task_result.url)
        } else if (taskStatus === 'failed'){
            console.log('Task Failed: ' + taskStatus)
        } else {
            console.log('Waiting for result...Status: ' + taskStatus)
            setTimeout(function(){
                getStatus(r.data.task_id)
            }, 5000)
        }
    })
}

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        // height: '390',
        // width: '640',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
            }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    player.mute()
    // event.target.muteVideo();
    // event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        toggle_audio_mute()
        play_audio(getVideoCurrentTime())
        setTimeout(function () {
            console.log('wait 0.8 sec')
            diff = getVideoCurrentTime() - $('audio').get(0).currentTime - 0.06
            sync_audio(diff)
        }, 800)
        toggle_audio_mute()
        //
        // setTimeout(sync_audio(diff),
        //     1000)

    } else if (event.data == YT.PlayerState.PAUSED) {
        //pause audio player
        stop_audio()
    }
}

//Helper functions

function playVideo(){
    player.playVideo()
}

function stopVideo() {
    player.stopVideo();
}

function muteVideo(){
    player.mute()
}

function getVideoCurrentTime(){
    return player.getCurrentTime()
}

function loadVideo() {
    player.loadVideoById($("li.queue").first().attr('video_id'))
    //set status to "loaded"
    $("li.queue").first().attr('status', 'loaded')
    $("li.queue").first().addClass('active')
    // console.log($("li.queue").first().attr('status'))
}

function cueVideo() {
    player.cueVideoById()
}


