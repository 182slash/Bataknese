const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const communityController = require('../controllers/communityController');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Create upload directories if they don't exist
const uploadDirs = [
  'uploads/avatars',
  'uploads/communities',
  'uploads/chat'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (req.baseUrl.includes('/auth') || req.baseUrl.includes('/users')) {
      uploadPath += 'avatars/';
    } else if (req.baseUrl.includes('/communities')) {
      uploadPath += 'communities/';
    } else if (req.baseUrl.includes('/chat')) {
      uploadPath += 'chat/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed'));
    }
  }
});

// ==================== AUTH ROUTES ====================
router.post('/auth/register', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('marga').trim().notEmpty().withMessage('Marga is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('province').optional().trim()
], authController.register);

router.post('/auth/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

router.get('/auth/profile', authenticate, authController.getProfile);

router.put('/auth/profile', 
  authenticate, 
  upload.single('avatar'),
  authController.updateProfile
);

router.get('/auth/marga-list', authController.getMargaList);

// ==================== USER ROUTES ====================
router.get('/users/search', authenticate, userController.searchUsers);
router.get('/users/stats', authenticate, userController.getUserStats);
router.get('/users/:userId', authenticate, userController.getUserById);

// ==================== COMMUNITY ROUTES ====================
router.post('/communities',
  authenticate,
  upload.single('avatar'),
  [
    body('name').trim().notEmpty().withMessage('Community name is required'),
    body('description').optional().trim(),
    body('category').optional().trim(),
    body('city').optional().trim(),
    body('province').optional().trim()
  ],
  communityController.createCommunity
);

router.get('/communities', authenticate, communityController.getCommunities);
router.get('/communities/my', authenticate, communityController.getMyCommunities);
router.get('/communities/:communityId', authenticate, communityController.getCommunityById);

router.put('/communities/:communityId',
  authenticate,
  upload.single('avatar'),
  communityController.updateCommunity
);

router.delete('/communities/:communityId', authenticate, communityController.deleteCommunity);

// Community membership
router.post('/communities/:communityId/join', authenticate, communityController.joinCommunity);
router.delete('/communities/:communityId/leave', authenticate, communityController.leaveCommunity);
router.get('/communities/:communityId/members', authenticate, communityController.getCommunityMembers);

// Role management
router.put('/communities/:communityId/members/:memberId/role',
  authenticate,
  [body('role').isIn(['leader', 'vice_leader', 'secretary', 'treasurer', 'supervisor', 'member'])
    .withMessage('Invalid role')],
  communityController.assignRole
);

// ==================== CHAT ROUTES ====================
// Direct Messages
router.get('/chat/dm/:userId', authenticate, chatController.getOrCreateDMRoom);
router.get('/chat/dm', authenticate, chatController.getMyDMRooms);
router.get('/chat/unread', authenticate, chatController.getUnreadCount);

// Community Chat
router.get('/chat/community/:communityId', authenticate, chatController.getCommunityChatRoom);

// Messages
router.get('/chat/rooms/:roomId/messages', authenticate, chatController.getRoomMessages);
router.post('/chat/rooms/:roomId/messages',
  authenticate,
  upload.single('image'),
  chatController.sendMessage
);

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bataknese API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
