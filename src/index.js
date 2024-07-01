const express               = require('express');
const Routes                = require('./routes/routes');
const defaultconfig         = require('./defaultConfig.json');
const cors= require("cors");
const http = require('http');



const app = express();
const port = defaultconfig.PORT;
app.use(cors());



app.use(express.json());


//Calling Routes
app.use(Routes);
const server = http.createServer(app);
server.timeout = 10000 ; // connection timeout set to 10 second
server.on('timeout', (socket) => {      
    // Customize the response sent to the client on timeout
    const response = {
        success: false,
        message: 'Request timed out'
    };
    
    // Serialize the response object to JSON and send it as the response
    socket.write('HTTP/1.1 200 Request Timeout\r\n\r\n');
    socket.end(JSON.stringify(response));
});

// Start the server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
