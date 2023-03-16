const { genSaltSync, hashSync } = require('bcrypt');

const db = require('../models')
const User = db.users
var bcrypt = require('bcrypt');

module.exports = {
    createUser : async (req, res) => {
        
        const body = req.body;
        let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

        if(!Object.hasOwn(body, "first_name") || !Object.hasOwn(body, "last_name") || !Object.hasOwn(body, "password") || !Object.hasOwn(body, "username") || Object.hasOwn(body, "account_created") || Object.hasOwn(body, "account_updated") || Object.hasOwn(body, "id") || !body.first_name || !body.last_name || !body.password || !body.username || regex.test(body.username) == false)
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        if(typeof body.first_name != 'string' || typeof body.last_name != 'string' || typeof body.username != 'string' ||  typeof body.password != 'string')
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);

        let info = 
        {
            first_name : body.first_name,
            last_name : body.last_name,
            password : body.password,
            username : body.username,
            account_created : new Date().toJSON(),
            account_updated : new Date().toJSON()
        }

        let username = await User.findOne({ where: { username: info.username }})
        if(username != null)
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        const user = await User.create(info)

        return res.status(201).json({
             "id" : user.id,
             "first_name" : user.first_name,
             "last_name" : user.last_name,
             "username" : user.username,
             "account_created" : user.account_created,
             "account_updated" : user.account_updated
        });

    },

    checkUserNamePassword : async (username, password, callback) => {

        let results = await User.findOne({ where: { username: username }})
        if(results == null)
        {
            return callback(false)
        }
        return callback(bcrypt.compareSync(password, results.dataValues.password));

    },

    getEmail : async (id, callback) => {

        let results = await User.findOne({ where: { id: id }})
        if(results == null)
        {
            return callback(false, null)
        }
        return callback(true, results.dataValues.username)

    },
    
    getUsersById : async (req, res) => {

        const id = req.params.id;
        let results = await User.findOne({ where: { id: id }})

        return res.json({
            "id" : results.id,
            "first_name" : results.first_name,
            "last_name" : results.last_name,
            "username" : results.username,
            "account_created" : results.account_created,
            "account_updated" : results.account_updated
        });
    },

    getUserIdByEmail : async (username, callback) => {

        let results = await User.findOne({ where: { username: username }})
        return callback(results.id)
    },

    updateUser : async (req, res) => {

        const id = req.params.id;
        const body = req.body;

        let results = await User.findOne({ where: { id: id }})

        if(Object.hasOwn(body, "id") || Object.hasOwn(body, "username") || Object.hasOwn(body, "account_created") || Object.hasOwn(body, "account_updated")) 
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        if((Object.hasOwn(body, "first_name") && typeof body.first_name != 'string') || (Object.hasOwn(body, "last_name") && typeof body.last_name != 'string') || (Object.hasOwn(body, "password") && typeof body.password != 'string'))
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        if((Object.hasOwn(body, "first_name") && !body.first_name) || (Object.hasOwn(body, "last_name") && !body.last_name) || (Object.hasOwn(body, "password") && !body.password))
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        body["first_name"] = Object.hasOwn(body, "first_name") ? body["first_name"] : results.dataValues.first_name
        body["last_name"] = Object.hasOwn(body, "last_name") ? body["last_name"] : results.dataValues.last_name
        body["account_updated"] = new Date().toJSON()
        
        if(Object.hasOwn(body, "password"))
        {
            const salt = genSaltSync(10);
            body.password = hashSync(body.password, salt);
        }
        else
        {
            body.password = results.dataValues.password
        }

        const product = await User.update(body, { where: { id: id }})
        return res.status(204).json();

    }
};