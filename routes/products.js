const express = require('express');
const router = express.Router();
const DatabaseManager = require('../database/DatabaseManager');
const { requireAuth, requireRole } = require('../middleware/auth');

const db = new DatabaseManager();

// Middleware to require authentication for all product routes
router.use(requireAuth);

// GET /products - Get all products (accessible by admin and viewer)
router.get('/', requireRole(['admin', 'viewer']), async (req, res) => {
    try {
        const products = await db.getAllProducts();
        res.json({
            success: true,
            message: 'Products retrieved successfully',
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve products'
        });
    }
});

// GET /products/:id - Get specific product (accessible by admin and viewer)
router.get('/:id', requireRole(['admin', 'viewer']), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await db.getProductById(productId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product retrieved successfully',
            product: product
        });
    } catch (error) {
        console.error('Error retrieving product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve product'
        });
    }
});

// POST /products - Create new product (admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body;

        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required fields'
            });
        }

        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a non-negative number'
            });
        }

        if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a non-negative number'
            });
        }

        const result = await db.createProduct(
            name, 
            description || '', 
            price, 
            quantity || 0
        );

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            productId: result.lastInsertRowid,
            product: {
                id: result.lastInsertRowid,
                name,
                description: description || '',
                price,
                quantity: quantity || 0
            }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
});

// PUT /products/:id - Update product (admin only)
router.put('/:id', requireRole(['admin']), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, description, price, quantity } = req.body;

        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // Check if product exists
        const existingProduct = await db.getProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name and price are required fields'
            });
        }

        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a non-negative number'
            });
        }

        if (quantity !== undefined && (typeof quantity !== 'number' || quantity < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a non-negative number'
            });
        }

        const result = await db.updateProduct(
            productId,
            name,
            description || '',
            price,
            quantity !== undefined ? quantity : existingProduct.quantity
        );

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: 'No changes were made to the product'
            });
        }

        // Get updated product
        const updatedProduct = await db.getProductById(productId);

        res.json({
            success: true,
            message: 'Product updated successfully',
            product: updatedProduct
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product'
        });
    }
});

// DELETE /products/:id - Delete product (admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }

        // Check if product exists
        const existingProduct = await db.getProductById(productId);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const result = await db.deleteProduct(productId);

        if (result.changes === 0) {
            return res.status(400).json({
                success: false,
                message: 'Failed to delete product'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
            deletedProduct: existingProduct
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product'
        });
    }
});

module.exports = router;