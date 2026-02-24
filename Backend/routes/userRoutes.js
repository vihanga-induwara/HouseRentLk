const express = require('express');
const router = express.Router();
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowStatus,
    getBrokers,
    getPublicProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/brokers', getBrokers);
router.get('/profile/:id', getPublicProfile);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/followers', protect, getFollowers);
router.get('/follow-status/:id', protect, getFollowStatus);

module.exports = router;
