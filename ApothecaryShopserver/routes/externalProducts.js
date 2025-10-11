const express = require('express');
const router = express.Router();
const externalProductController = require('../controllers/externalProductController');

/**
 * @swagger
 * /api/external-products:
 *   get:
 *     tags:
 *       - External Products
 *     summary: Get external products from Jan Aushadhi API
 *     description: Fetch products from the Jan Aushadhi external API with pagination and search capabilities
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageIndex
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Page index for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: Number of items per page
 *       - in: query
 *         name: searchText
 *         schema:
 *           type: string
 *           default: ""
 *         description: Text to search for in product names
 *         example: "paracetamol"
 *       - in: query
 *         name: columnName
 *         schema:
 *           type: string
 *           default: "id"
 *         description: Column name to sort by
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "asc"
 *         description: Sort order
 *     responses:
 *       200:
 *         description: External products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 responseBody:
 *                   type: object
 *                   properties:
 *                     newProductResponsesList:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                             example: 22
 *                           genericName:
 *                             type: string
 *                             example: "Paracetamol Tablets IP 500 mg"
 *                           groupName:
 *                             type: string
 *                             example: "OTC"
 *                           drugCode:
 *                             type: integer
 *                             example: 23
 *                           unitSize:
 *                             type: string
 *                             example: "10's"
 *                           mrp:
 *                             type: number
 *                             format: float
 *                             example: 7
 *                           status:
 *                             type: integer
 *                             example: 1
 *                           serialNo:
 *                             type: integer
 *                             example: 7
 *                     pageIndex:
 *                       type: integer
 *                       example: 0
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalElement:
 *                       type: integer
 *                       example: 40
 *                     isLastPage:
 *                       type: boolean
 *                       example: false
 *                     isFirstPage:
 *                       type: boolean
 *                       example: true
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *                 message:
 *                   type: string
 *                   example: "record found successfully"
 *                 responseCode:
 *                   type: integer
 *                   example: 200
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error or external API error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', externalProductController.getExternalProducts);

module.exports = router;