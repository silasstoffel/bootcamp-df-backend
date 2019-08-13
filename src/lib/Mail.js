import nodeMailer from 'nodemailer';
import expHbs from 'express-handlebars';
import nodemailerHbs from 'nodemailer-express-handlebars';
import { resolve } from 'path';
import mailConfig from '../config/mail';

class Mail {
    constructor() {
        const { host, port, secure, auth } = mailConfig;
        this.trasporter = nodeMailer.createTransport({
            host,
            port,
            secure,
            auth: auth.user ? auth : null,
        });
        this.configTemplates();
    }

    send(params) {
        return this.trasporter.sendMail({
            ...mailConfig.default,
            ...params,
        });
    }

    configTemplates() {
        const viewPath = resolve(__dirname, '..', 'app', 'views', 'email');

        const hbsParams = {
            viewEngine: expHbs.create({
                layoutsDir: resolve(viewPath, 'layouts'),
                partialsDir: resolve(viewPath, 'partials'),
                defaultLayout: 'default',
                extname: '.hbs',
            }),
            viewPath,
            extName: `.hbs`,
        };

        this.trasporter.use('compile', nodemailerHbs(hbsParams));
    }
}

export default new Mail();
