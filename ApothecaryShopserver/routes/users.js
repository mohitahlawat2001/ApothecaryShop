const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { adminOnly } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validation');
const { userManagementSchemas } = require('../validation/schemas');

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: User management endpoints (Admin only)
 */

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get user statistics
 *     description: Retrieve statistics about users (total, by role, by provider, recent users)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     byRole:
 *                       type: object
 *                     byProvider:
 *                       type: object
 *                     recentUsers:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/stats', adminOnly, userController.getUserStats);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, staff]
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', adminOnly, userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', adminOnly, userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags:
 *       - User Management
 *     summary: Create a new user
 *     description: Create a new user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *               provider:
 *                 type: string
 *                 enum: [local, google, facebook]
 *                 default: local
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       409:
 *         description: Email already registered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', adminOnly, validate({ body: userManagementSchemas.create }), userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - User Management
 *     summary: Update a user
 *     description: Update user information (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already in use
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:id', adminOnly, validate({ body: userManagementSchemas.update }), userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - User Management
 *     summary: Delete a user
 *     description: Delete a user account (Admin only). Admins cannot delete their own account.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.delete('/:id', adminOnly, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     tags:
 *       - User Management
 *     summary: Toggle user status
 *     description: Activate or deactivate a user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       501:
 *         description: Status toggle not implemented in model
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.patch('/:id/status', adminOnly, validate({ body: userManagementSchemas.toggleStatus }), userController.toggleUserStatus);

module.exports = router;
