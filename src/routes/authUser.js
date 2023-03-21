const express = require('express');
const router = express.Router();
const common = require('../middleware/common')

const controller= require('../controller/authController')

// router.use(routerLevelMiddleware)    // for all endpoints but only for this router

router.get('/', controller.defaultPage );
router.get('/signup', controller.get_signup );
router.post('/signup', common.userExistence, common.genHash, controller.post_signup );
router.get('/login', controller.get_login );
router.post('/login', controller.post_login );
router.get('/home', common.auth, controller.home );
router.get('/refresh-token', common.auth, controller.refreshToken );
// router.get('/profile', controller.listView );

module.exports = router;