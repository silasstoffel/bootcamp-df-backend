import './config/dotEnvStart';
import express from 'express';
import routes from './routes';
import './database';

class Server {
    constructor() {
        this.isDev = process.env.NODE_ENV !== 'production';
        this.express = express();
        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.express.use(express.json());
    }

    routes() {
        this.express.use(routes);
    }

    exception() {}
}

export default new Server().express;
