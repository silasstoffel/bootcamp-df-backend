module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('meetups', 'address', Sequelize.STRING);
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('meetups', 'address');
    },
};
