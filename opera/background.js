/*******************************************************************************
**
** Copyright (C) 2012 Typhos
**
** This Source Code Form is subject to the terms of the Mozilla Public
** License, v. 2.0. If a copy of the MPL was not distributed with this
** file, You can obtain one at http://mozilla.org/MPL/2.0/.
**
*******************************************************************************/

function sync_prefs(prefs) {
    localStorage.prefs = JSON.stringify(prefs);
}

function prefs_updated(prefs) {
}

function dl_file(url) {
    // BIG FATE NOTE: set user-agent
}

if(localStorage.prefs === undefined) {
    localStorage.prefs = "{}";
}

var pref_manager = manage_prefs(localStorage, JSON.parse(localStorage.prefs), sync_prefs, prefs_updated, dl_file);

// XHR request from background process = load file data. Weird.
function get_file_data(filename) {
    var request = new XMLHttpRequest();
    request.open("GET", filename, false);
    request.send();

    if(!request.responseText) {
        console.log("BPM: ERROR: Can't read from file: '" + filename + "'");
        return;
    } else {
        return request.responseText;
    }
}

// Content script requests
opera.extension.onmessage = function(event) {
    var message = event.data;

    switch(message.method) {
        case "get_prefs":
            event.source.postMessage({
                "method": "prefs",
                "prefs": pref_manager.get_prefs()
            });
            break;

        case "set_prefs":
            pref_manager.write_prefs(message.prefs)
            break;

        case "get_file":
            var data = get_file_data(message.filename);

            if(data) {
                event.source.postMessage({
                    "method": "file_loaded",
                    "filename": message.filename,
                    "data": data
                });
            }
            break;

        default:
            console.log("BPM: ERROR: Unknown request from content script: '" + message.request + "'");
            break;
    }
};
