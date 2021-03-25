$(function () {

    // Set up websocket and connect to server
    const ws = new WebSocket('ws://localhost:3000');

    // Some basic variables we need
    const doc = $(document),
        win = $(window),
        canvas = $('#canv1'),
        ctx = canvas[0].getContext('2d');

    const chat = document.querySelector("#chat1");
    const button = document.querySelector("#send");
    const name = document.querySelector("#name");
    const message = document.querySelector("#message");


    // Generate a client ID
    const id = Math.round($.now() * Math.random());

    // Choose user color
    const colors = ['#fc3344', '#ffb600', '#20258c', '#4bff00'];
    // Random user color, can be deleted later when we have a color picker
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    var clientColor = randomColor; // Here the user color needs to be set later

    sendChatMessage('system', 'color ' + clientColor + ' was assigned to you.')

    // Error message if Browser does not support canvas
    if(!('getContext' in document.createElement('canvas'))){
        alert('Your browser does not support canvas!');
        sendChatMessage('system', 'Your browser does not support canvas!')
        return false;
    }


    // On open connection to server:
    ws.onopen = function () {
        //ws.send('Hello Client here');
    };

    // Event - This function is called when a message is received from the server:
    ws.onmessage =  function (msg) {
        console.log("received: " + msg.data);

        const jsonMsg = JSON.parse(msg.data);

        // -------------------------
        // INCOMING MESSAGE HANDLING
        // -------------------------

        // If its a 'draw' message, we draw the received coordinates and color
        if(jsonMsg.type == 'draw') {
            drawLine(jsonMsg.prevX, jsonMsg.prevY, jsonMsg.x, jsonMsg.y, jsonMsg.color);
        }

        // If its a 'chat' message, we display name and message in chat
        if(jsonMsg.type == 'chat') {
            chat.innerHTML += jsonMsg.name + ': ' + jsonMsg.msg + '</br>';
        }
        // Change color message, etc......
        //if(jsonMsg.type == 'changeColor') ...

        // -----------------------------
        // INCOMING MESSAGE HANDLING END
        // -----------------------------
    };



    // -------------------------
    // OUTGOING MESSAGE HANDLING
    // -------------------------

    // CHAT

    // On Event "Send" button is clicked, we send chat data to server
    button.addEventListener('click', function() {

        // The data we send to server:
        const data = {
            type: 'chat',
            clientId: id,
            name: name.value,
            msg: message.value,
        };

        // Send as JSON:
        ws.send(JSON.stringify(data));

        // clear input field
        message.value = "";
    });


    // DRAWING

    var drawing = false;
    var prev = {};

    // On Event mousedown inside the canvas
    canvas.on('mousedown', function(e){

        // we set drawing flag
        drawing = true;

        // save the starting coodinates:
        prev.x = e.pageX;
        prev.y = e.pageY;

        // set cursor to crosshair
        $('#canv1').css('cursor', 'crosshair'); //
    });

    // On Event mouseup or when mouse leaves canvas we clear drawing flag
    doc.bind('mouseup mouseleave',function(){

        // clear the drawing flag
        drawing = false;

        // set cursor back to default
        $('#canv1').css('cursor', 'default');
    });

    // On Event mousemove we send drawing data to server
    //   This function is called everytime the user moves a pixel, so if the user draws a
    //   line this function is called multiple times
    canvas.on('mousemove',function(e){
        // We draw only if mousedown is active (drawing flag)
        if(drawing){

            // The data we send to server:
            const data = {
                type: 'draw',
                clientId: id,
                color: clientColor,
                prevX: prev.x,
                prevY: prev.y,
                x: e.pageX,
                y: e.pageY,
            }

            // Send as JSON:
            ws.send(JSON.stringify(data));

            // save new starting coodinates:
            prev.x = e.pageX;
            prev.y = e.pageY;
        }
    });

    // -----------------------------
    // OUTGOING MESSAGE HANDLING END
    // -----------------------------



    // This function handles the drawing on the canvas
    function drawLine(fromX, fromY, toX, toY, color){
        ctx.strokeStyle = color;
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
    }

    // This function sends a chat message
    function sendChatMessage(name, message){
        chat.innerHTML += name + ': ' + message + '</br>';
    }
});