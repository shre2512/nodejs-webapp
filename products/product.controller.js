const { getUserIdByEmail } = require('../users/user.controller');
const db = require('../models')
const Product = db.products
const Image = db.images
const connection = require('../config/database')

var AWS = require('aws-sdk')
// AWS.config.update({
//     accessKeyId: S3_credentials.S3_ACCESS_KEY,
//     secretAccessKey: S3_credentials.S3_SECRET_ACCESS_KEY,
//     region: S3_credentials.S3_BUCKET_REGION
// })
const s3 = new AWS.S3();

module.exports = {
    createProduct : async (req, res) => {
        
        const body = req.body;
        if(!Object.hasOwn(body, "name") || !Object.hasOwn(body, "description") || !Object.hasOwn(body, "sku") || !Object.hasOwn(body, "manufacturer") || !Object.hasOwn(body, "quantity") || Object.hasOwn(body, "id") || Object.hasOwn(body, "date_added") || Object.hasOwn(body, "date_last_updated") || Object.hasOwn(body, "owner_user_id") || !body.name || !body.description || !body.manufacturer || !body.quantity || !body.sku || !Number.isInteger(body.quantity) || body.quantity < 0 || body.quantity > 100)
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        if(typeof body.name != 'string' || typeof body.description != 'string' || typeof body.sku != 'string' || typeof body.manufacturer != 'string')
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        let results = await Product.findOne({ where: { sku: body.sku }})
        if(results != null)
        {
            return res.status(400).json({
                message : "Bad Request"
            });
        }

        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]
        
        getUserIdByEmail(username, async (userId) => {

            let info = 
            {
                name : body.name,
                description : body.description,
                sku : body.sku,
                manufacturer : body.manufacturer,
                quantity : body.quantity,
                date_added : new Date().toJSON(),
                date_last_updated : new Date().toJSON(),
                owner_user_id : userId
            }

            const product = await Product.create(info)

            return res.status(201).json({
                "id" : product.id,
                "name" : product.name,
                "description" : product.description,
                "sku" : product.sku,
                "manufacturer" : product.manufacturer,
                "quantity" : product.quantity,
                "date_added": product.date_added,
                "date_last_updated": product.date_last_updated,
                "owner_user_id": product.owner_user_id
            });
        })
    },

    getProduct : async (req, res) => {
        const productId = req.params.productId
        let results = await Product.findOne({ where: { id: productId }})
        if(results == null)
        {
            return res.status(404).json({
                message : "Not Found"
            });
        }
        else
        {
            return res.status(200).json({
                "id" : results.id,
                "name" : results.name,
                "description" : results.description,
                "sku" : results.sku,
                "manufacturer" : results.manufacturer,
                "quantity" : results.quantity,
                "date_added": results.date_added,
                "date_last_updated": results.date_last_updated,
                "owner_user_id": results.owner_user_id
            });
        }
    },

    deleteProduct : (req, res) => {

        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]
        getUserIdByEmail(username, async (userId) => {
            let results = await Product.findOne({ where: { id: req.params.productId }})

            if(results == null)
            {
                return res.status(404).json({
                    message : "Not Found"
                });
            }
            else if(results.owner_user_id != userId)
            {
                return res.status(403).json({
                    message : "Forbidden"
                });
            }
            else
            {
                let selectAll = await Image.findAll({ where: { product_id: results.id }})
                let i = 0;
        
                while (i < selectAll.length)
                {
                    const myArray = selectAll[i].dataValues.s3_bucket_path.split("/");
                    const deleteParams = {
                        Bucket : connection.S3,
                        Key : myArray[myArray.length - 1]
                    }
                    const promise = await s3.deleteObject(deleteParams).promise();
                    let deleted = await Image.destroy({ where: { image_id: selectAll[i].dataValues.image_id }})
                    i++;
                }
                let deleted = await Product.destroy({ where: { id: results.id }})
                return res.status(204).json();
            }
        })
    },

    updateProductPatch : async (req, res) => {

        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]
        const body = req.body;
        
        getUserIdByEmail(username, async (userId) => {
            let results = await Product.findOne({ where: { id: req.params.productId }})

            if(results == null)
            {
                return res.status(404).json({
                    message : "Not Found"
                });
            }
            else if(results.owner_user_id != userId)
            {
                return res.status(403).json({
                    message : "Forbidden"
                });
            }
            else
            {

                if(Object.hasOwn(body, "id") || Object.hasOwn(body, "date_added") || Object.hasOwn(body, "date_last_updated") || Object.hasOwn(body, "owner_user_id"))
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                } 
                
                if((Object.hasOwn(body, "name") && !body.name) || (Object.hasOwn(body, "description") && !body.description) || (Object.hasOwn(body, "manufacturer") && !body.manufacturer) || (Object.hasOwn(body, "quantity") && !body.quantity) || (Object.hasOwn(body, "sku") && !body.sku))
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                } 
                
                if((Object.hasOwn(body, "name") && typeof body.name != 'string') || (Object.hasOwn(body, "description") && typeof body.description != 'string') || (Object.hasOwn(body, "sku") && typeof body.sku != 'string') || (Object.hasOwn(body, "manufacturer") && typeof body.manufacturer != 'string'))
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                }

                if(Object.hasOwn(body, "sku"))
                {
                    let results = await Product.findOne({ where: { sku: body.sku }})
                    if(results != null && results.id != req.params.productId)
                    {
                        return res.status(400).json({
                            message : "Bad Request"
                        });
                    }
                }
        
                if(Object.hasOwn(body, "quantity"))
                {
                    if(!Number.isInteger(body.quantity) || body["quantity"] > 100 || body["quantity"] < 0)
                    {
                        {
                            return res.status(400).json({
                                message : "Bad Request"
                            });
                        }
                    }
                }

                let info = 
                {
                    name : body["name"] = Object.hasOwn(body, "name") ? body["name"] : results.dataValues.name,
                    description : body["description"] = Object.hasOwn(body, "description") ? body["description"] : results.dataValues.description,
                    sku : body["sku"] = Object.hasOwn(body, "sku") ? body["sku"] : results.dataValues.sku,
                    manufacturer : body["manufacturer"] = Object.hasOwn(body, "manufacturer") ? body["manufacturer"] : results.dataValues.manufacturer,
                    quantity : body["quantity"] = Object.hasOwn(body, "quantity") ? body["quantity"] : results.dataValues.quantity,
                    date_last_updated : new Date().toJSON()
                }

                let updated = await Product.update(info, { where: { id: req.params.productId }})
                return res.status(204).json();
            }
        })
        
    },

    updateProductPut : async(req, res) => {

        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]
        const body = req.body;
        
        getUserIdByEmail(username, async (userId) => {
            let results = await Product.findOne({ where: { id: req.params.productId }})

            if(results == null)
            {
                return res.status(404).json({
                    message : "Not Found"
                });
            }
            else if(results.owner_user_id != userId)
            {
                return res.status(403).json({
                    message : "Forbidden"
                });
            }
            else
            {

                if(Object.hasOwn(body, "id") || Object.hasOwn(body, "date_added") || Object.hasOwn(body, "date_last_updated") || Object.hasOwn(body, "owner_user_id"))
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                }
                
                if(!Object.hasOwn(body, "name") || !Object.hasOwn(body, "description") || !Object.hasOwn(body, "manufacturer") || !Object.hasOwn(body, "quantity") || !Object.hasOwn(body, "sku"))
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                }
                
                if(!body.name || typeof body.name != 'string' || !body.description || typeof body.description != 'string'|| !body.manufacturer || typeof body.manufacturer != 'string' || !body.quantity || !body.sku || typeof body.sku != 'string')
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                } 
                
                let results = await Product.findOne({ where: { sku: body.sku }})
                if(results != null && results.id != req.params.productId)
                {
                    return res.status(400).json({
                        message : "Bad Request"
                    });
                }
        
                if(!Number.isInteger(body.quantity) || body["quantity"] > 100 || body["quantity"] < 0)
                {
                    {
                        return res.status(400).json({
                            message : "Bad Request"
                        });
                    }
                }

                let info = 
                {
                    name : body["name"],
                    description : body["description"],
                    sku : body["sku"],
                    manufacturer : body["manufacturer"],
                    quantity : body["quantity"],
                    date_last_updated : new Date().toJSON()
                }

                let updated = await Product.update(info, { where: { id: req.params.productId }})
                return res.status(204).json();
            }
        })

    },

    getUserProduct : async (userId, productId, callback) => {
        let results = await Product.findOne({ where: { owner_user_id: userId, id: productId}})
        return callback(results)
    }
}