$(function() {
  // Connect to SkyWay, have server assign an ID instead of providing one
  // Showing off some of the configs available with SkyWay:).
  const peer = new Peer({
    // Set API key for cloud server (you don't need this if you're running your
    // own.
    key: window.__SKYWAY_KEY__,
    // Set highest debug level (log everything!).
    debug: 3,
    // Set a logging function:
    logFunction: args => {
      const copy = [...args].join(' ');
      $('.log').append(copy + '<br>');
    },
  });
  const connectedPeers = {};





  // Connect to a peer
  peer.on('open', () => {

    const requestedPeer = $('div.identifier').attr('id');
    if (!connectedPeers[requestedPeer]) {
      // Create 2 connections, one labelled chat and another labelled file.
      const c = peer.connect(requestedPeer, {
        label: 'chat',
        metadata: {
          message: 'hi i want to chat with you!'
        },
      });

      c.on('open', () => {
        connect(c);
        connectedPeers[requestedPeer] = 1;
      });

      c.on('error', err => alert(err));


    }

});

  // Close a connection.
  $('#close').on('click', () => {
    eachActiveConnection(c => {
      c.close();
    });
  });


  //変更を監視
  $('textarea#sp').keyup(function() {
    // For each active connection, send the message.
    var msg = $('textarea#sp').val();
    eachActiveConnection((c) => {
      if (c.label === 'chat') {
        c.send(msg);

      }
    });

  });




  // Make sure things clean up properly.
  window.onunload = window.onbeforeunload = function(e) {
    if (!!peer && !peer.destroyed) {
      peer.destroy();
    }
  };

  // Handle a connection object.
  function connect(c) {
    // Handle a chat connection.
    if (c.label === 'chat') {
      const chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.remoteId);
      const messages = $('<div><em>Peer connected.</em></div>').addClass('messages');

      chatbox.append(messages);
      // Select connection handler.
      chatbox.on('click', () => {
        chatbox.toggleClass('active');
      });

      $('.filler').hide();
      $('#connections').append(chatbox);


      c.on('close', () => {
        alert(c.remoteId + ' has left the chat.');
        chatbox.remove();
        if ($('.connection').length === 0) {
          $('.filler').show();
        }
        delete connectedPeers[c.remoteId];
      });
    } else if (c.label === 'file') {
      c.on('data', function(data) {
        // If we're getting a file, create a URL for it.
        let dataBlob;
        if (data.constructor === ArrayBuffer) {
          dataBlob = new Blob([new Uint8Array(data)]);
        } else {
          dataBlob = data;
        }
        const filename = dataBlob.name || 'file';
        const url = URL.createObjectURL(dataBlob);
        $('#' + c.remoteId).find('.messages').append('<div><span class="file">' +
          c.remoteId + ' has sent you a <a target="_blank" href="' + url + '" download="' + filename + '">file</a>.</span></div>');
      });
    }
    connectedPeers[c.remoteId] = 1;
  }

  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    const actives = $('.active');
    const checkedIds = {};
    actives.each((_, el) => {
      var peerId = $('div.identifier').attr('id');
    //  peerId = $('#rid').value;
      console.log('te');
      if (!checkedIds[peerId]) {
        const conns = peer.connections[peerId];
        for (let i = 0, ii = conns.length; i < ii; i += 1) {
          const conn = conns[i];
          fn(conn, $(el));
        }
      }
      checkedIds[peerId] = 1;
    });
  }
});
