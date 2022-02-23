import socketIo from 'socket.io';

import { SYMBOL_PRICE_CHANGE_EVENT } from '../constants/constants';

import { pricesEvents } from '../controllers/pricesController';

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

server.listen(8080, () => {});

const io = socketIo(server);

class PricesWebsocketController {
    start () {
        io.on('connection', (client) => {
            pricesEvents.on(SYMBOL_PRICE_CHANGE_EVENT, data => {
                client.emit('message', data.assetPriceChange);
            });
        });
    }
}

const pricesWebsocketController = new PricesWebsocketController();

export default pricesWebsocketController;
