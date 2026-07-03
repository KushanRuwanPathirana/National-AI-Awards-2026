const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact.controller');
const { body } = require('express-validator');

const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

// @route   POST /api/contact
router.post('/', contactValidator, submitContact);

module.exports = router;
