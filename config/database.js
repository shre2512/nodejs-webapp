// module.exports = {
//     HOST: process.env.DB_HOST,
//     USER: process.env.DB_USER,
//     PASSWORD: process.env.DB_PASSWORD,
//     DB: process.env.DB_POSTGRESQL,
//     dialect: process.env.DB_DIALECT,

//     pool: {
//         max: 5,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// }

const fs = require('fs');

const data = fs.readFileSync("/home/ec2-user/config.json"); 
const temp = JSON.parse(data);

module.exports = {
    HOST: temp.host.split(":")[0],
    USER: temp.username,
    PASSWORD: temp.password,
    DB: temp.database,
    dialect: "postgres",
    S3: temp.s3,    

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}