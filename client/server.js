
//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));

app.get('/skat-server-url', (req, res) => 
{
    res.send({url: process.env.SKAT_SERVER_URL || ''});
})

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname+'/dist/index.html'));
});

// Start the app by listening on the host-provided port
app.listen(process.env.PORT || 4200);