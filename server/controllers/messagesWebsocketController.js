import socketIo from 'socket.io';

import isString from '@tinkoff/utils/is/string';
import uniqid from 'uniqid';

import saveMessage from '../api/client/message/queries/saveMessage';

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

server.listen(5050, () => { });

const io = socketIo(server);

const verifyTokenFuncMap = {
    admin: verifyTokenAdmin,
    client: verifyTokenClient
};

const connections = {};

class MessagesWebsocketController {
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

                        client.on('message', ({ receiverId, text }) => {
                            if (!text || !isString(text)) {
                                return;
                            }

                            const resultReceiverId = data.type === 'admin' ? receiverId : 'admin';
                            const now = Date.now();
                            const message = {
                                id: uniqid(),
                                receiverId: resultReceiverId,
                                senderId: clientId,
                                createdAt: now,
                                text,
                                visited: false
                            };

                            saveMessage(message)
                                .then(() => {
                                    client.emit('message', message);

                                    if (connections[resultReceiverId]) {
                                        for (const [targetClient] of connections[resultReceiverId].entries()) {
                                            targetClient.emit('message', message);
                                        }
                                    }
                                });
                        });
                    });
            });
        });
    }
}

const messagesWebsocketController = new MessagesWebsocketController();

export default messagesWebsocketController;
