
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
    } else if (data.type === 'PAUSE') {
        player.pauseVideo()
    } else if (data.type === 'SEEK') {
        const seconds = data.seconds
        const currentTime = player.getCurrentTime()
        if (Math.abs(seconds - currentTime) > 1) {
            player.seekTo(seconds, true) // (seconds, allowSeekAhead)
        }
    } else if (data.type === 'RATE') {
        const rate = data.rate
        player.setPlaybackRate(rate)
    } else if (data.type === 'LOAD') {
        const id = data.id
        player.loadVideoById(id)
    }
}