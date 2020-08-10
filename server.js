
const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const port = process.env.PORT || 8080


// init
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })


// configure
app.use(express.static('public'))

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message)
        wss.clients.forEach(function each(client) {
            console.log(ws, client.readyState)
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })
    })

    ws.send(JSON.stringify({
        type: "CONNECTION"
    }))
})


// listen
server.listen(port, () => {
    console.log(`Youtube sync application listening at http://localhost:${port}`)
})
