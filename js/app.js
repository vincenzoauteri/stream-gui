var chatConn = 0;
var cardsConn = 0;
// When the connection is open, send some data to the server
var trackPlaying = false;
var chatConnIntervalId = 0;
var cardConnIntervalId = 0;

var setupChatWebsocket = function(){
    chatConn = new WebSocket('ws://localhost:23456/chat',[]);

    chatConn.onopen = function () {
        console.log ("Chat connection open");
        /*
           chatConn.send('getDonger'); // Send the message 'Ping' to the server
           setInterval(function() {
           chatConn.send('getDonger'); // Send the message 'Ping' to the server
           }, 10000);

           chatConn.send('getMove'); // Send the message 'Ping' to the server
           setInterval(function() {
           chatConn.send('getMove'); // Send the message 'Ping' to the server
           }, 5000);

           chatConn.send('getVoiceMessage'); // Send the message 'Ping' to the server
           setInterval(function() {
           chatConn.send('getVoiceMessage'); // Send the message 'Ping' to the server
           }, 10000);
           */
    };

    chatConn.onclose = function () {
        cardConnIntervalId = setTimeout(function() {
            console.log ("connection state " + chatConn.readyState);
            console.log('WebSocket closed trying to reconnect');
            setupChatWebsocket();
        }, 5000);
    };

    chatConn.onerror = function (error) {
        console.log ("connection state " + chatConn.readyState);
        console.log('WebSocket Error ' + error );
    };

    chatConn.onmessage = function (e) {
        console.log('Server Answer' + e.data);
        var jsonChat = $.parseJSON(e.data);
        switch (jsonChat["id"]) {
            case "playMessage":
                console.log(jsonChat["payload"]);
                responsiveVoice.speak(jsonChat["payload"])
                    break;
            case "move":
                if ($("#card_list li").length > 20) {
                    console.log("Length");
                    $("#card_list li").remove();
                }
                $("#card_list").prepend("<li>"+ jsonChat["payload"] +"</li>");
                //$("#play").html(jsonChat["payload"]);
                break;

            case "donger":
                $("#donger").html(jsonChat["payload"]);
                break;

            case "playTrack":
                track = jsonChat["payload"];
                console.log(track);
                if (trackPlaying  === false) {
                    trackPlaying = true;
                    console.log("Searching track");
                    searchTrack(track);
                } 
                break;
        }
    };
};
setupChatWebsocket();

var setupCardsWebsocket = function(){
    cardsConn = new WebSocket('ws://localhost:12345/cards',[]);

    cardsConn.onopen = function () {
        //cardsConn.send('getCards'); // Send the message 'Ping' to the server
        console.log ("Card connection open");
    };

    cardsConn.onclose= function () {
        console.log ("connection state " + chatConn.readyState);
        cardConnIntervalId = setTimeout(function() {
            console.log('WebSocket closed trying to reconnect');
            setupCardsWebsocket();
        }, 5000);
    };

    // Log errors
    cardsConn.onerror = function (error) {
        console.log ("connection state " + chatConn.readyState);
        console.log('WebSocket Error ' + error );
    };
    cardsConn.onmessage = function (e) {
        console.log(e.data)
            var jsonCards = $.parseJSON(e.data);
        for (var key in jsonCards) {
            $("#card_list").append("<li>"+ key + "  => "+ jsonCards[key] + "</li>");
        }
    };
};
setupCardsWebsocket();


playTrackLocally = function(track) {
    console.log('opening new window');

    spotifyWindow = window.open('https://play.spotify.com/track/' + track.id,'_blank');

    if (track.duration_ms > 0) {
        $("#now_playing").html('<div>Playing ' + track.name + ' by ' + track.artists[0].name+'</div>' );
        setTimeout(function() {
            spotifyWindow.close();
            trackPlaying = false;
        }, track.duration_ms + 10000);
    } 
    /*
       $.ajax({
       url: 'https://play.spotify.com/track/' + id,
       cache: false            
       })
       .success(function(response) {
       $("#now_playing").html('<div>Playing ' + track.name + ' by ' + track.artists[0].name + '</div><img width="150" src="' + track.album.images[1].url + '">');
       console.log("Play Track Received response:" + response);
       });
       */
}

searchTrack = function (track) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
    cache: false,            
    data: {
        type: 'track',
    q: track,
    limit : 1,
    market : 'ES'
    }
    })
    .done(function( response) {
        var track = response.tracks.items[0];
        if (track) {
            console.log(track);
            playTrackLocally(track);
        } else {
            trackPlaying = false;
        }
    });
}
