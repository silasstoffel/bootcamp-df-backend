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
                address: Sequelize.STRING,
            },
            { sequelize }
        );
        return this;
    }

    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
        this.belongsTo(models.File, {
            foreignKey: 'file_id',
            as: 'file',
        });
    }
}

export default Meetup;
