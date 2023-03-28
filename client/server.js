
//Install express server
const express = require('express');
const path = require('path');
const fs = require('fs');

const skatRules = fs.readFileSync('./src/assets/skatrules.md').toString();

console.log('skat Rules content:', skatRules);

async function render(markdown) {
    return (await fetch('https://api.github.com/markdown', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'mode': 'markdown', 'text': markdown})
    })).text();
}

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist'));

app.get('/skat-server-url', (req, res) => 
{
    res.send({url: process.env.SKAT_SERVER_URL || ''});
})

app.get('/skatrules.html', async (req, res) => 
{
    res.send(await render(skatRules));
})

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/index.html'));
});

// Start the app by listening on the host-provided port
app.listen(process.env.PORT || 4200);