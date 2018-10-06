## Intention
This project will become an app for hosting playing card games in the browser. I am using the wonderful SocketIO Typescript Chat project below as a starting point. The rest of the info in this file regards that project; more info regarding the card game engine as it's built.

## Progress
Many features are functional; more are being added. This app is now being hosted on Heroku!

[Card-game Client](http://mean-card-game-client.herokuapp.com)

You may have to poke the server and wait a moment, since free heroku dynos tend to fall asleep.
Note there is literally no web front-end, so this call will return an error (cannot GET /), but it will wake the server up.
[Card-game Server](http://mean-card-game-server.herokuapp.com)




<p align="center">
    <a href="https://github.com/tridecagon/mean-card-game">
    </a>
    <a href="https://github.com/luixaviles/socket-io-typescript-chat">
        <img src="https://img.shields.io/github/stars/luixaviles/socket-io-typescript-chat.svg?style=social&label=Star" alt="GitHub stars">
    </a>
    <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fluixaviles%2Fsocket-io-typescript-chat&via=luixaviles&text=Take%20a%20look%20this%20%23TypeScript%20chat%20project%20using%20%23Node%20and%20%23Angular%20Material">
        <img src="https://img.shields.io/twitter/url/https/github.com/luixaviles/socket-io-typescript-chat.svg?style=social" alt="Tweet">
    </a>
</p>


## Blog Post
Read the blog post with details about this project: [Real Time Apps with TypeScript: Integrating Web Sockets, Node & Angular](https://medium.com/dailyjs/real-time-apps-with-typescript-integrating-web-sockets-node-angular-e2b57cbd1ec1) 

## Live Demo
Try live demo: [https://typescript-chat.firebaseapp.com](https://typescript-chat.firebaseapp.com)

# Support this project
- Star GitHub repository :star:
- Create pull requests, submit bugs or suggest new features
- Follow updates on [Twitter](https://twitter.com/luixaviles) or [Github](https://github.com/luixaviles)

![](https://luixaviles.com/assets/images/posts/typescript-chat/typescript-chat.gif?raw=true)

# Running Server and Client locally
## Prerequisites

First, ensure you have the following installed:

1. NodeJS - Download and Install latest version of Node: [NodeJS](http://http://nodejs.org)
2. Git - Download and Install [Git](http://git-scm.com)
3. Angular CLI - Install Command Line Interface for Angular [https://cli.angular.io/](https://cli.angular.io/)

After that, use `Git bash` to run all commands if you are on Windows platform.

## Clone repository

In order to start the project use:

```bash
$ git clone https://github.com/luixaviles/socket-io-typescript-chat.git
$ cd socket-io-typescript-chat
```

## Run Server

To run server locally, just install dependencies and run `gulp` task to create a build:

```bash
$ cd server
$ npm install -g gulp-cli
$ npm install
$ gulp build
$ npm start
```

The `socket.io` server will be running on port `8080`

## Run Angular Client

Open other command line window and run following commands:

```bash
$ cd client
$ npm install
$ ng serve
```

Now open your browser in following URL: [http://localhost:4200](http://localhost:4200/)

## License

MIT
