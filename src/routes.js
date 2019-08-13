import Express from 'express';
import multer from 'multer';

import multerCfg from './config/multer';
import authMiddleware from './app/middlewares/auth';

// Controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import Meetup from './app/controllers/MeetupController';
import Subscription from './app/controllers/SubscriptionController';

const routes = Express.Router();
const upload = multer(multerCfg);

/**
 * Sessions | Users
 * ### Rotas públicas ###
 */
routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

/**
 * Abaixo são todas rotas necessária de autenticação
 */
routes.use(authMiddleware);

// Usuário
routes.put('/users', UserController.update);

// Upload
routes.post('/files', upload.single('file'), FileController.store);

// Meetups
routes.get('/meetups', Meetup.index);
routes.post('/meetups', Meetup.store);
routes.put('/meetups', Meetup.update);
routes.delete('/meetups/:id', Meetup.delete);

// Subscriptions
routes.get('/subscriptions', Subscription.index);
routes.post('/subscriptions', Subscription.store);
routes.put('/subscriptions', Subscription.update);
routes.delete('/subscriptions/:id', Subscription.delete);

export default routes;
