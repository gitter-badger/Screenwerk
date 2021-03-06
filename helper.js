var fs          = require('fs')
var stringifier = require('./stringifier.js')

__LOG_DIR = 'sw-log/'

fs.lstat(__LOG_DIR, function(err, stats) {
    if (err) {
        console.log ('Creating folder for ' + __LOG_DIR)
        fs.mkdir(__LOG_DIR)
    }
    else if (!stats.isDirectory()) {
        console.log ('Renaming existing file "' + __LOG_DIR + '" to "' + __LOG_DIR + '.bak')
        fs.renameSync(__LOG_DIR, __LOG_DIR + '.bak')
        console.log ('Creating folder for ' + __LOG_DIR)
        fs.mkdir(__LOG_DIR)
    }
})


var datestring = new Date().toISOString().replace(/T/, ' ').replace(/:/g, '-').replace(/\..+/, '')
var c_stream_path = __LOG_DIR + './Console ' + datestring + '.log'
var s_stream_path = __LOG_DIR + './System ' + datestring + '.log'
var consoleStream = fs.createWriteStream(c_stream_path, {flags:'a'})
var sysLogStream = fs.createWriteStream(s_stream_path, {flags:'a'})
var log_streams_are_closed = false
var message_q = []
var swLog = window.swLog = function swLog(message, scope) {
    console.log(message)
    if (log_streams_are_closed) {
        console.log('Log files are closed already.')
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

function noOp(err) {
    if (err) {
        console.log('noOp err', err)
    }
    console.log('noOp')
}

var bytesToSize = function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes == 0) return '0'
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    var decimals = Math.max(0, i-1)
    return (bytes / Math.pow(1024, i)).toFixed(decimals) + ' ' + sizes[i]
}

var msToTime = function msToTime(ms) {
    if (ms === 0) {
        return '0'
    }
    var decimals = 0
    var unit = ''
    var amount = 0
    if (ms < 1000 * 60) {
        decimals = 1
        unit = 'sec'
        amount = ms / 1000
    } else if (ms < 1000 * 60 * 60) {
        decimals = 1
        unit = 'min'
        amount = ms / 1000
    } else if (ms < 1000 * 60 * 60 * 24) {
        decimals = 1
        unit = 'h'
        amount = ms / 1000
    } else if (ms < 1000 * 60 * 60 * 24 * 7) {
        decimals = 2
        unit = 'd'
        amount = ms / 1000
    } else {
        decimals = 2
        unit = 'w'
        amount = ms / 1000 / 60 / 60 / 24 / 7
    }
    return amount.toFixed(decimals) + ' ' + unit
}
