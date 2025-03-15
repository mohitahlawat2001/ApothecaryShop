const express = require('express');
const router = express.Router();
const externalProductController = require('../controllers/externalProductController');
const auth = require('../middleware/auth');

/**
 * @api {get} /api/external-products Get External Products
 * @apiDescription Fetches products from the Jan Aushadhi external API
 * @apiName GetExternalProducts
 * 
 * @apiParam {Number} [pageIndex=0] Page index for pagination
 * @apiParam {Number} [pageSize=100] Number of items per page
 * @apiParam {String} [searchText=""] Text to search for
 * @apiParam {String} [columnName="id"] Column name to sort by
 * @apiParam {String} [orderBy="asc"] Sort order (asc or desc)
 * 
 * @apiExample {curl} Example usage:
 *     curl -X GET 'http://localhost:5000/api/external-products?pageIndex=0&pageSize=10&searchText=paracetamol' \
 *       -H 'Authorization: Bearer YOUR_AUTH_TOKEN'
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     
 *     {"responseBody":{"newProductResponsesList":[{"productId":1,"genericName":"Aceclofenac 100mg and Paracetamol 325mg Tablets","groupName":"Acute","drugCode":1,"unitSize":"10's","mrp":10,"status":1,"serialNo":1},{"productId":5,"genericName":"Chlorzoxazone 500mg, Diclofenac 50mg and Paracetamol 325mg Tablets","groupName":"Acute","drugCode":6,"unitSize":"10's","mrp":25,"status":1,"serialNo":2},{"productId":13,"genericName":"Ibuprofen 400mg and Paracetamol 325mg Tablets IP","groupName":"Acute","drugCode":14,"unitSize":"10's","mrp":8,"status":1,"serialNo":3},{"productId":18,"genericName":"Nimesulide 100mg and Paracetamol 325mg Tablets","groupName":"Acute","drugCode":19,"unitSize":"10's","mrp":11,"status":1,"serialNo":4},{"productId":20,"genericName":"Diclofenac Sodium 50mg and Paracetamol 325mg Tablets IP","groupName":"Acute","drugCode":21,"unitSize":"10's","mrp":9.9,"status":1,"serialNo":5},{"productId":21,"genericName":"Paracetamol Paediatric Oral Suspension IP 125 mg per 5 ml","groupName":"Acute","drugCode":22,"unitSize":"60 ml","mrp":11,"status":1,"serialNo":6},{"productId":22,"genericName":"Paracetamol Tablets IP 500 mg","groupName":"OTC","drugCode":23,"unitSize":"10's","mrp":7,"status":1,"serialNo":7},{"productId":150,"genericName":"Paracetamol 325mg and Dicyclomine Hydrochloride 20mg Tablets","groupName":"Acute","drugCode":184,"unitSize":"10's","mrp":8,"status":1,"serialNo":8},{"productId":397,"genericName":"Paracetamol 325mg and Tramadol 37.5mg Tablets","groupName":"Acute","drugCode":510,"unitSize":"10's","mrp":13.2,"status":1,"serialNo":9},{"productId":398,"genericName":"Paracetamol Tablets IP 650 mg","groupName":"OTC","drugCode":511,"unitSize":"15's","mrp":15,"status":1,"serialNo":10}],"pageIndex":0,"pageSize":10,"totalElement":40,"isLastPage":false,"isFirstPage":true,"totalPages":4},"message":"record found successfully","responseCode":200}
 */
router.get('/', auth, externalProductController.getExternalProducts);

module.exports = router;