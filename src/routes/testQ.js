const express = require('express');
const router = express.Router();

const controller= require('../controller/test/testController')
// router.use(routerLevelMiddleware)    // for all endpoints but only for this router

router.get('/', controller.getData)
router.get('/iife', controller.iife );
router.get('/read-csv', controller.readCsv );
router.get('/insert-csv', controller.insertCsv);
router.get('/anagram', controller.checkAnagram)
router.get('/generate-pdf', controller.generatePDF);

module.exports = router;