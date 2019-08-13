import Sequelize from 'sequelize';

import connectionParms from '../config/database';
import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';
import Subscription from '../app/models/Subscription';

const models = [User, File, Meetup, Subscription];

class Database {
    constructor() {
        this.init();
    }

    init() {
        this.cnx = new Sequelize(connectionParms);
        models
            .map(m => m.init(this.cnx))
            .map(m => m.associate && m.associate(this.cnx.models));
    }
}

export default new Database();
