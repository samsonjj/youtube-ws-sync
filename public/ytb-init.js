// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        // playerVars: {
        //     origin: 'mysite.com'
        // }
    });

    player.waitFor = []
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    console.log('player is ready')
    function initSocket() {
        window.ws = createYtWebsocket(player, function onClose() {
            initSocket()
        })
    }
    initSocket()
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
let _prevState = -1000
function onPlayerStateChange(event) {
    console.log('player state change', event.data)
    const state = event.data
    const prevState = _prevState
    _prevState = state

    if (state === YT.PlayerState.PLAYING && player.lastSync) {
        console.log('seeking!')
        player.seekTo(Date.now() / 1000 - player.lastSync)
        player.lastSync = undefined
        player.waitFor.push(YT.PlayerState.PLAYING)
    }

    console.log({'waitFor': player.waitFor, state})
    if (player.waitFor.length > 0) {
        if (state === player.waitFor[0]) {
            player.waitFor.splice(0, 1)
        }
        return
    }

    if (state === YT.PlayerState.UNSTARTED) {
        return
    }

    send({
        type: 'SEEK',
        sync: Date.now() / 1000 - player.getCurrentTime()
    })
    if (state === YT.PlayerState.PLAYING) {
        const seconds = player.getCurrentTime()
        console.log('about to seek')
        send({ type: 'PLAY' })
    } else if (state === YT.PlayerState.PAUSED) {
        send({ type: 'PAUSE' })
    } else if (state === YT.PlayerState.BUFFERING) {
        // if (prevState === YT.PlayerState.UNSTARTED) return
        send({ type: 'PAUSE' })
    } else if (state === YT.PlayerState.ENDED) {
        // NOTHING
    } else if (state === YT.PlayerState.CUED) {
        // NOTHING
    } else if (state === YT.PlayerState.UNSTARTED) {
        // NOTHING
    }
}

function send(data) {
    const id = document.getElementById('id').value
    if (!window.ws) {
        throw Error('websocket is not present in the window object')
    }
    console.log('ws sending', { ...data, id })
    ws.send(JSON.stringify({ ...data, id }))
}
function stopVideo() {
    player.stopVideo();
}