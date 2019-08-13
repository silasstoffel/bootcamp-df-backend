import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
    static init(sequelize) {
        super.init(
            {
                title: Sequelize.STRING,
                description: Sequelize.TEXT,
                date: Sequelize.DATEONLY,
                hour: Sequelize.TIME,
                user_id: Sequelize.INTEGER,
                file_id: Sequelize.INTEGER,
            },
            { sequelize }
        );
        return this;
    }
}

export default Meetup;
