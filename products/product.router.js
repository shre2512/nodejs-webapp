const { createProduct, deleteProduct, updateProductPatch, updateProductPut, getProduct } = require('./product.controller')
const {createImage, getImage, getAllImages, deleteImage} = require('../images/image.controller')

const router = require('express').Router();
const {checkProductRouter} = require('../auth/validation');

router.get('/:productId', getProduct);
router.post('/', checkProductRouter, createProduct);
router.delete('/:productId', checkProductRouter, deleteProduct);
router.patch('/:productId', checkProductRouter, updateProductPatch);
router.put('/:productId', checkProductRouter, updateProductPut);
router.post('/:productId/image', checkProductRouter, createImage);
router.get('/:productId/image/:imageId', checkProductRouter, getImage);
router.get('/:productId/image', checkProductRouter, getAllImages);
router.delete('/:productId/image/:imageId', checkProductRouter, deleteImage);

module.exports = router;