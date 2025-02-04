const Product = require('../models/product')
const { Storage } = require('@google-cloud/storage')
const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_CLOUD_KEYFILE
  })

class ProductController {
    static registerProduct(req, res, next){
        const { title, description, price, qty, brand } = req.body
        let image = null
        if(req.file){
            image = req.file.cloudStoragePublicUrl
        }
        Product.create({
            title, description, price, qty, image, brand
        })
        .then(response => {
            res.status(201).json(response)
        })
        .catch(err =>{
            if(req.itemId){
                storage.bucket(process.env.GOOGLE_CLOUD_BUCKET)
                .file(req.itemId).delete()
            }
            next(err)
        })
    }
    static getAll(req, res, next){
        Product.find().sort({ createdAt: "desc" })
        .then(products =>{
            if(products.length !== 0) res.status(200).json(products)
            else res.status(204).json({ message: 'Product not available' })
        })
        .catch(next)
    }
    static remove(req, res, next){
        Product.findByIdAndDelete({
            _id: req.params.id
        })
        .then(response =>{
            let filename = response.image.replace(/(https:\/\/storage.googleapis.com\/wood_pecker\/)/, '')
            storage.bucket(process.env.GOOGLE_CLOUD_BUCKET)
            .file(filename).delete()
            res.status(200).json({ message: "Product successfully deleted"})
        })
        .catch(next)
    }
    static getBrand(req, res, next){
        Product.find({brand: req.params.brand}).sort({ createdAt: "desc" })
        .then(products =>{
            if(products.length !== 0) res.status(200).json(products)
            else res.status(204).json({ message: 'Product not available' })
        })
        .catch(next)
    }
    static updateItem(req, res, next){
        const { title, description, price, qty, brand } = req.body
        let image = null
        if(req.file){
            image = req.file.cloudStoragePublicUrl
        }
        Product.findById({
            _id: req.params.id
        })
        .then(product =>{
            if(!image) {
                image = product.image
            }else{
                let filename = product.image.replace(/(https:\/\/storage.googleapis.com\/wood_pecker\/)/, '')
                storage.bucket(process.env.GOOGLE_CLOUD_BUCKET)
                .file(filename).delete()
            }
            return Product.update({
                _id: req.params.id
            },{
                title, description, price, qty, brand, image
            })
        })
        .then(_ =>{
            res.status(200).json({ message: "Succefully updated"})
        })
        .catch(next)
    }
}
module.exports = ProductController