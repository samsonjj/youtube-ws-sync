
// Idea: on youtube init, attach click listeners to video playback control elements (i.e. play/pause etc.) for
// for elements outside iframe API capabilities, e.g. playback rate

function createYtWebsocket(player, onClose) {
    ws = new WebSocket("ws://localhost:8080")

    ws.player = player 

    ws.onopen = function opening() {
        console.log('WEBSOCKET OPEN')
    }

    ws.onmessage = function incoming(msg) {
        console.log(msg)
        handleMessage(ws, msg)
    }

    ws.onclose = function closing() {
        console.log('WEBSOCKET CLOSED')
        if (onClose) onClose()
    }

    ws.onerror = function(err) {
        console.error(err)
    }

    return ws
}

function handleMessage(ws, msg) {
    const player = ws.player

    const data = JSON.parse(msg.data)
    
    if (data.type === 'PLAY') {
        player.playVideo()
        player.waitFor = [YT.PlayerState.PLAYING]
    } else if (data.type === 'PAUSE') {
        // if (player.waitFor[0] === YT.PlayerState.PAUSED) {
        //     player.waitFor = player.waitFor.split(0, 1)
        // }
        player.pauseVideo()
        player.waitFor = [YT.PlayerState.PAUSED]
    } else if (data.type === 'SEEK') {
        const sync = data.sync
        const mySync = Date.now() / 1000 - player.getCurrentTime()
        if (Math.abs(mySync - sync) > 0) {
            player.lastSync = sync
            // player.seekTo(Date.now() / 1000 - sync, true) // (seconds, allowSeekAhead)
        }
    } else if (data.type === 'RATE') {
        const rate = data.rate
        player.setPlaybackRate(rate)
    } else if (data.type === 'LOAD') {
        const id = data.videoId
        player.loadVideoById(id)
        player.waitFor = [YT.PlayerState.PAUSED]
    }
}