const { getUserIdByEmail } = require('../users/user.controller')
const crypto = require('crypto')
const { getUserProduct } = require('../products/product.controller')
const db = require('../models')
const Image = db.images
var AWS = require('aws-sdk')
const connection = require('../config/database')

// AWS.config.update({
//     accessKeyId: S3_credentials.S3_ACCESS_KEY,
//     secretAccessKey: S3_credentials.S3_SECRET_ACCESS_KEY,
//     region: S3_credentials.S3_BUCKET_REGION
// })

const s3 = new AWS.S3();

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

module.exports = {
    createImage : async(req, res) => {

        const productId = req.params.productId
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]

        getUserIdByEmail(username, async (userId) => {
            getUserProduct(userId, productId, async (results) => {
                if(results == null)
                {
                    return res.status(403).json({
                        message : "Forbidden"
                    });
                }
                else
                {
                    if(req.files == null || !req.files.data)
                    {
                        return res.status(400).json({
                            message : "Bad Request"
                        })
                    }
                    const fileContent = Buffer.from(req.files.data.data, 'binary')
                    const uploadParams = {
                        // Bucket : S3_credentials.S3_BUCKET_NAME,
                        Bucket : connection.S3,
                        Key : randomImageName(),
                        Body : fileContent,
                        ContentType : req.files.data.mimetype
                    }
                    const promise = await s3.upload(uploadParams).promise();
                    let info = 
                    {
                        file_name : req.files.data.name,
                        date_created : new Date().toJSON(),
                        s3_bucket_path : promise.Location,
                        product_id : productId
                    }
                    const image = await Image.create(info)

                    return res.status(201).json({
                        "image_id": image.image_id,
                        "product_id": image.product_id,
                        "file_name": image.file_name,
                        "date_created": image.date_created,
                        "s3_bucket_path": image.s3_bucket_path
                    })
                }

            })

        })

    },

    getImage : async(req, res) => {
        const productId = req.params.productId
        const imageId = req.params.imageId
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]
        let checkImageExists = await Image.findOne({ where: { image_id: imageId }})
        if(checkImageExists == null)
        {
            return res.status(404).json({
                message : "Not Found"
            });
        }

        getUserIdByEmail(username, async (userId) => {
            getUserProduct(userId, productId, async (results) => {
                if(results == null)
                {
                    return res.status(403).json({
                        message : "Forbidden"
                    });
                }
                let selctOne = await Image.findOne({ where: { image_id: imageId, product_id: productId}})
                if(selctOne == null)
                {
                    return res.status(403).json({
                        message : "Forbidden"
                    });
                }
                return res.status(200).json(selctOne.dataValues);
            })
        })
    },

    getAllImages : async(req, res) => {
        const productId = req.params.productId
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]

        getUserIdByEmail(username, async (userId) => {
            getUserProduct(userId, productId, async (results) => {
                if(results == null)
                {
                    return res.status(403).json({
                        message : "Forbidden"
                    });
                }
                let selectAll = await Image.findAll({ where: { product_id: productId }})
                results = []
                let i = 0;
        
                while (i < selectAll.length)
                {
                    results.push(selectAll[i].dataValues);
                    i++;
                }
                return res.status(200).json(results); 
            })
        })  
    },

    deleteImage : async(req, res) => {
        const productId = req.params.productId
        const imageId = req.params.imageId
        var credentials = Buffer.from(req.get('Authorization').split(' ')[1], 'base64').toString().split(':')    
        var username = credentials[0]
        let checkImageExists = await Image.findOne({ where: { image_id: imageId }})
        if(checkImageExists == null)
        {
            return res.status(404).json({
                message : "Not Found"
            });
        }

        getUserIdByEmail(username, async (userId) => {
            
            getUserProduct(userId, productId, async (results) => {
                if(results == null)
                {
                    return res.status(403).json({
                        message : "Forbidden"
                    });
                }
                let selctOne = await Image.findOne({ where: { image_id: imageId, product_id: productId}})
                if(selctOne == null)
                {
                    return res.status(403).json({
                        message : "Forbidden"
                    });
                }
                const myArray = selctOne.dataValues.s3_bucket_path.split("/");
                const deleteParams = {
                    Bucket : connection.S3,
                    // Bucket : S3_credentials.S3_BUCKET_NAME,
                    Key : myArray[myArray.length - 1]
                }
                const promise = await s3.deleteObject(deleteParams).promise();
                let deleted = await Image.destroy({ where: { image_id: imageId }})
                return res.status(204).json();
            })
        })
    },
    
    deleteImagesProduct : async(product_id) => {

        let selectAll = await Image.findAll({ where: { product_id: product_id }})
        let i = 0;

        while (i < selectAll.length)
        {
            const myArray = selectAll[i].dataValues.s3_bucket_path.split("/");
            const deleteParams = {
                Bucket : connection.S3,
                // Bucket : S3_credentials.S3_BUCKET_NAME,
                Key : myArray[myArray.length - 1]
            }
            const promise = await s3.deleteObject(deleteParams).promise();
            let deleted = await Image.destroy({ where: { image_id: selectAll[i].dataValues.image_id }})
            i++;
        }
        return true;
    }
}