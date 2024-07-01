const express       = require('express');
const controller    = require('../controllers/controllers');
const Router        = express.Router();


Router.post('/login', controller.login);
Router.post('/setCaseStudy',controller.setCaseStudy);
Router.get('/getCaseStudy',controller.getCaseStudy);
Router.post('/setTestimonials',controller.setTestimonials);
Router.get('/getTestimonials',controller.getTestimonials);
Router.post('/setLeadership',controller.setLeadership);
Router.get('/getLeadership',controller.getLeadership);

module.exports = Router;
