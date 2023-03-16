const database = require('../config/database.js')

const {Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize(
    database.DB,
    database.USER,
    database.PASSWORD, {
        host: database.HOST,
        dialect: database.dialect,
        operatorsAliases: false,

        pool: {
            max: database.pool.max,
            min: database.pool.min,
            acquire: database.pool.acquire,
            idle: database.pool.idle
        }
    }
)

sequelize.authenticate()
.then(() => {
    console.log('connected..')
})
.catch(err => {
    console.log('Error'+ err)
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.users = require('./userModel.js')(sequelize, DataTypes)
db.products = require('./productModel.js')(sequelize, DataTypes)
db.images = require('./imageModel.js')(sequelize, DataTypes)


db.users.hasMany(db.products, {
    foreignKey: 'owner_user_id',
    as: 'owner_user_id'
})

db.products.hasMany(db.images, {
    foreignKey: 'product_id',
    as: 'product_id'
})

db.sequelize.sync({ force: false })
.then(() => {
    console.log('yes re-sync done!')
})

module.exports = db