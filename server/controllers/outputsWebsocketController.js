import socketIo from 'socket.io';

import verifyTokenAdmin from '../helpers/verifyTokenAdmin';
import verifyTokenClient from '../helpers/verifyTokenClient';

import https from 'https';
import http from 'http';
import fs from 'fs';
import express from 'express';

const credentials = {
    key: fs.readFileSync('server/https/private-new.key'),
    cert: fs.readFileSync('server/https/certificate.crt'),
    ca: []
};
const app = express();
const server = process.env.NODE_ENV === 'production' ? https.createServer(credentials, app) : http.createServer(app);

server.listen(6060, () => { });

const io = socketIo(server);

const verifyTokenFuncMap = {
    admin: verifyTokenAdmin,
    client: verifyTokenClient
};

const connections = {};

class OutputsWebsocketController {
    start () {
        io.on('connection', (client) => {
            client.on('token', data => {
                verifyTokenFuncMap[data.type](data.token)
                    .then(user => {
                        const clientId = data.type === 'admin' ? 'admin' : user.id;

                        if (!clientId) {
                            return;
                        }

                        if (!connections[clientId]) {
                            connections[clientId] = new Map();
                        }

                        connections[clientId].set(client, 1);

                        client.on('disconnect', () => {
                            connections[clientId].delete(client);
                        });
                    });
            });
        });
    }

    sendOutput (output) {
        const receiverId = 'admin';

        if (connections[receiverId]) {
            for (const [targetClient] of connections[receiverId].entries()) {
                targetClient.emit('output', output);
            }
        }
    }
}

const outputsWebsocketController = new OutputsWebsocketController();

export default outputsWebsocketController;
