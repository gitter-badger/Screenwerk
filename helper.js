var fs          = require('fs')
var stringifier = require('./stringifier.js')


// var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
// var consoleStream = fs.createWriteStream(c_stream_path, {flags:'a'})
// var sysLogStream = fs.createWriteStream(s_stream_path, {flags:'a'})
// var c_stream_path = './Console ' + datestring + '.log'
// var s_stream_path = './System ' + datestring + '.log'
var log_streams_are_closed = false
var message_q = []
var swLog = window.swLog = function swLog(message, scope) {
    console.log(message)
    if (log_streams_are_closed) {
        console.log('Log files are closed allready.')
        return { end: function() {return false}}
    }
    if (scope === undefined)
        scope = 'INFO'
    now = new Date()
    message_q.push(scope + ' ' + message)
    if (window.document.body !== null) {
        var console_DOM = window.document.getElementById('console')
        if (console_DOM === null) {
            console_DOM = document.createElement('pre')
            console_DOM.id = 'console'
            document.body.appendChild(console_DOM)
        }
        console_DOM.textContent = message_q.join('\n') + '\n' + console_DOM.textContent
        message_q = []
    }
    if (scope === 'SYSTEM')
        sysLogStream.write(now.toString().slice(0,24) + ': ' + message + '\n')
    else
        consoleStream.write(now.toString().slice(0,24) + ' ' + scope + ': ' + message + '\n')

    return {
        end: function() {
            log_streams_are_closed = true
            sysLogStream.end()
            consoleStream.end()
            return {'c_stream_path': c_stream_path, 's_stream_path': s_stream_path}
        }
    }
}

var progress = window.progress = function progress(message) {
    if (window.document.body !== null) {
        var progress_DOM = window.document.getElementById('progress')
        if (progress_DOM === null) {
            progress_DOM = document.createElement('pre')
            progress_DOM.id = 'progress'
            document.body.appendChild(progress_DOM)
        }
        progress_DOM.textContent = message
        document.getElementById('progress').style.display = 'block'
    }
}

var decrementProcessCount = function decrementProcessCount() {
    -- loading_process_count
    progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
}
var incrementProcessCount = function decrementProcessCount() {
    ++ loading_process_count
    progress(loading_process_count + '| ' + bytesToSize(total_download_size) + ' - ' + bytesToSize(bytes_downloaded) + ' = ' + bytesToSize(total_download_size - bytes_downloaded) )
}

var error = window.error = function error(message, link) {
    if (window.document.body !== null) {
        var error_DOM = window.document.getElementById('error')
        if (error_DOM === null) {
            error_DOM = document.createElement('div')
            error_DOM.id = 'error'
            document.body.appendChild(error_DOM)
        }
        if (link === undefined)
            error_DOM.textContent = message
        else {
            var a_DOM = document.createElement('a')
            a_DOM.href = link
            a_DOM.textContent = message
            error_DOM.appendChild(a_DOM)
        }

        document.getElementById('error').style.display = 'block'
    }
    return {
        finish: function() {
            document.getElementById('error').style.display = 'none'
        }
    }
}

var bytesToSize = function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}