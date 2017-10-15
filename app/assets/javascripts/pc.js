$(function() {
  // Connect to SkyWay, have server assign an ID instead of providing one
  // Showing off some of the configs available with SkyWay:).
  const peer = new Peer({
    // Set API key for cloud server (you don't need this if you're running your
    // own.
    key:         window.__SKYWAY_KEY__,
    // Set highest debug level (log everything!).
    debug:       3,
    // Set a logging function:
    logFunction: args => {
      const copy = [...args].join(' ');
      $('.log').append(copy + '<br>');
    },
  });
  const connectedPeers = {};

  // Show this peer's ID.
  //リンク・QR作成
  peer.on('open', id => {
    $('#pid').text(id);
  //  $('#plink').text('こちら');
    $('#plink').attr('href', 'http://localhost:3000/sp/'+id);
    $('#qrcode').qrcode({width: 256, height: 256, text: 'http://localhost:3000/sp/'+id});
  });
  // Await connections from others
  peer.on('connection', c => {
    // Show connection when it is completely ready
    c.on('open', () => connect(c));
  });
  peer.on('error', err => console.log(err));



  // Connect to a peer
  $('#connect').on('submit', e => {
    e.preventDefault();
    const requestedPeer = $('#rid').val();
    if (!connectedPeers[requestedPeer]) {
      // Create 2 connections, one labelled chat and another labelled file.
      const c = peer.connect(requestedPeer, {
        label:    'chat',
        metadata: {message: 'hi i want to chat with you!'},
      });

      c.on('open', () => {
        connect(c);
        connectedPeers[requestedPeer] = 1;
      });

      c.on('error', err => alert(err));

      const f = peer.connect(requestedPeer, {label: 'file', reliable: true});

      f.on('open', () => {
        connect(f);
      });

      f.on('error', err => alert(err));
    }
  });

  // Close a connection.
  $('#close').on('click', () => {
    eachActiveConnection(c => {
      c.close();
    });
  });

  // Send a chat message to all active connections.
  $('#send').on('submit', e => {
    e.preventDefault();
    // For each active connection, send the message.
    const msg = $('#text').val();
    eachActiveConnection((c, $c) => {
      if (c.label === 'chat') {
        c.send(msg);
        $c.find('.messages').append('<div><span class="you">You: </span>' + msg
          + '</div>');
      }
    });
    $('#text').val('');
    $('#text').focus();
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


      var textarea = $('textarea#area')
      c.on('data', data => {
      textarea.val(data);
      });

      c.on('close', () => {
        alert(c.remoteId + ' has left the chat.');


        delete connectedPeers[c.remoteId];
      });
    }
    connectedPeers[c.remoteId] = 1;
  }

  // Goes through each active peer and calls FN on its connections.
  function eachActiveConnection(fn) {
    const actives = $('.active');
    const checkedIds = {};
    actives.each((_, el) => {
      const peerId = $(el).attr('id');
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
