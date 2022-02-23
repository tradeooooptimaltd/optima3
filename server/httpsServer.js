import https from 'https';
import fs from 'fs';
import { redirectToHTTPS } from 'express-http-to-https';
import path from 'path';

function verification (app) {
    app.use((req, res, next) => {
        if (req.originalUrl.match(/^\/.well-known\/pki-validation\/4499C2F330CB68D3B26AB83EBFB151C3.txt/)) {
            return res.sendFile(path.resolve(__dirname, 'https', 'verification.txt'));
        }

        next();
    });
}

function httpsRedirect (app) {
    const ignoreHttpsHosts = [/:(\d{4})/];

    // redirects
    app.use(redirectToHTTPS(ignoreHttpsHosts, [], 301));
}

function startHttpsServer (app) {
    const HTTPS_PORT = 443;

    const credentials = {
        key: fs.readFileSync('server/https/private-new.key'),
        cert: fs.readFileSync('server/https/certificate.crt'),
        ca: []
    };

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(HTTPS_PORT);
}

export {
    verification,
    httpsRedirect,
    startHttpsServer
};
