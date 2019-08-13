/*
 * O usuário pode cadastrar meetups na plataforma com título do meetup, descrição, localização,
 * data e hora e imagem (banner).
 * Todos campos são obrigatórios.
 * Adicione também um campo user_id que armazena o ID do usuário que organiza o evento.
 */
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('meetups', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            hour: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION',
            },
            file_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'files',
                    key: 'id',
                },
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: queryInterface => {
        return queryInterface.dropTable('meetups');
    },
};
