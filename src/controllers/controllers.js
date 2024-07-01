const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mypool = require('../database/database');
const defaultConfig = require('../defaultConfig.json');
const Joi = require('joi');
const domainName = "http://womenworld.com.pk/women_world";
const domainPath = domainName + "/src/";
const md5 = require('md5');
const pool = require('../database/database.js'); // Adjust the path accordingly
const { query } = require('../database/database.js');

const axios = require('axios');

// // To handle the form-data
const mediaRestriction = (req, res, next) => {
    upload_pic.array('mediaContent', 30)(req, res, function (err) {
        if (err) {
            return res.json({
                success: false,
                message: `Unsupported file type. Please upload an image.`
            });
        }
        next();
    });
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    
        let destinationFolder = './usersdata/case_studies/'; // Default destination         
       
        cb(null, destinationFolder);
    },
    filename: (req, file, cb) => {
        const msisdn = (req.body.msisdn || req.msisdn || 'default_suffix').trim();
        const email = (req.body.email || req.email || 'default_suffix').trim(); // Add email handling
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);   
        console.log(fileExtension);       
        const identifier = req.email ? email : msisdn;
        cb(null, `${identifier}_${timestamp}${fileExtension}`);
   

}
});
const upload_pic = multer({
    storage
});

const upload = multer();

const controller = {

    login: [upload.any(), async (req, res) => {
        const login = req.body.login;
    const password = req.body.password;

    // Logging for debugging
    console.log('Received login:', login);
    console.log('Received password:', password);

    // Hash the entered password
    const hashedPassword = md5(password);

    // Query to check if the login and hashed password match in the "admin" table
    const sql = `SELECT * FROM admin WHERE login = ? AND password = ?`;

    try {
        const [results] = await pool.query(sql, [login, hashedPassword]);
        console.log(results);

        if (results.length === 1) {
            // If one record is found, the login and password are valid
            console.log("Login successful");
            res.json({ message: "Login successful" });
        } else {
            // If no records match, the login is invalid
            console.log("Invalid login credentials");
            const errorMessage = "Invalid login credentials";
            res.status(401).json({ error: errorMessage });
        }
    }  catch (err) {
            console.error(err);
            res.status(500).send("Internal Server Error");
        }
    }], 
    setCaseStudy: [mediaRestriction, async (req, res) => {
        try {
            const schema = Joi.object({
                image: Joi.string().required(),
                date: Joi.string().required(), // Adjusted to string since the example date was '10 oct'
                category: Joi.string().required(),
                sub_category: Joi.string().optional(),
                details: Joi.string().optional(),
            });
    
            const data = {
                image: req.files[0] ? req.files[0].path.replace(/\\/g, '/') : null,
                date: req.body.date,
                category: req.body.category,
                sub_category: req.body.sub_category,
                details: req.body.details,
            };
    
            console.log('Data to be inserted:', data);
    
            const result = schema.validate(data);
            if (result.error) {
                console.error(result.error.details[0].message);
                return res.json({
                    success: false,
                    message: result.error.details[0].message
                });
            }
    
            const { image, date, category, sub_category, details } = data;
    
            // Insert new profile data using promise-based approach
            const insertSql = `INSERT INTO casestudies (image, date, category, sub_category, details) VALUES (?, ?, ?, ?, ?)`;
    
            const [insertResult] = await pool.query(insertSql, [image, date, category, sub_category, details]);
            
            console.log('Case study created successfully');
            return res.send({
                success: true,
                message: 'Case study created successfully'
            });
    
        } catch (error) {
            console.error('Error in setCaseStudy API:', error);
            res.send({
                success: false,
                error: 'Error occurred: ' + error
            });
        }
    }],
    getCaseStudy: [mediaRestriction, async (req, res) => {
        try {
            // Construct SQL query to fetch all case studies
            const sql = `SELECT * FROM casestudies`;
    
            // Execute query
            const [rows] = await pool.query(sql);
    
            // Check if any case studies exist
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No case studies found' });
            }
    
            // Add domainPath to each case study's image field
            const caseStudies = rows.map(row => ({
                ...row,
                image: domainPath  + row.image
            }));
    
            // Return all case study data
            res.json({ success: true, caseStudies });
        } catch (error) {
            console.error('Error in getCaseStudy API:', error);
            res.status(500).json({ success: false, error: 'Error occurred: ' + error.message });
        }
    }],
    setTestimonials: [mediaRestriction, async (req, res) => {
        try {
            const schema = Joi.object({
                image: Joi.string().required(),
                date: Joi.string().required(), // Adjusted to string since the example date was '10 oct'
                name: Joi.string().required(),
                ratings: Joi.string().optional(),
                details: Joi.string().optional(),
            });
    
            const data = {
                image: req.files[0] ? req.files[0].path.replace(/\\/g, '/') : null,
                date: req.body.date,
                name: req.body.name,
                ratings: req.body.ratings,
                details: req.body.details,
            };
    
            console.log('Data to be inserted:', data);
    
            const result = schema.validate(data);
            if (result.error) {
                console.error(result.error.details[0].message);
                return res.json({
                    success: false,
                    message: result.error.details[0].message
                });
            }
    
            const { image, date, name, ratings, details } = data;
    
            // Insert new profile data using promise-based approach
            const insertSql = `INSERT INTO testimonials (image, date, name, ratings, details) VALUES (?, ?, ?, ?, ?)`;
    
            const [insertResult] = await pool.query(insertSql, [image, date, name,ratings, details]);
            
            console.log('Testimonials created successfully');
            return res.send({
                success: true,
                message: 'Testimonials created successfully'
            });
    
        } catch (error) {
            console.error('Error in Testimonials API:', error);
            res.send({
                success: false,
                error: 'Error occurred: ' + error
            });
        }
    }],
    getTestimonials: [mediaRestriction, async (req, res) => {
        try {
            // Construct SQL query to fetch all case studies
            const sql = `SELECT * FROM testimonials`;
    
            // Execute query
            const [rows] = await pool.query(sql);
    
            // Check if any case studies exist
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No case studies found' });
            }
    
            // Add domainPath to each case study's image field
            const caseStudies = rows.map(row => ({
                ...row,
                image: domainPath  + row.image
            }));
    
            // Return all case study data
            res.json({ success: true, caseStudies });
        } catch (error) {
            console.error('Error in getCaseStudy API:', error);
            res.status(500).json({ success: false, error: 'Error occurred: ' + error.message });
        }
    }],
    setLeadership: [mediaRestriction, async (req, res) => {
        try {
            const schema = Joi.object({
                image: Joi.string().required(),
                name: Joi.string().required(),
                designation: Joi.string().optional(),
            });
    
            const data = {
                image: req.files[0] ? req.files[0].path.replace(/\\/g, '/') : null,
                name: req.body.name,
                designation: req.body.designation,
            };
    
            console.log('Data to be inserted:', data);
    
            const result = schema.validate(data);
            if (result.error) {
                console.error(result.error.details[0].message);
                return res.json({
                    success: false,
                    message: result.error.details[0].message
                });
            }
    
            const { image,name, designation } = data;
            // Insert new profile data using promise-based approach
            const insertSql = `INSERT INTO leadership (image,name, designation) VALUES (?, ?, ?)`;
    
            const [insertResult] = await pool.query(insertSql, [image, name,designation]);
            
            console.log('Leadership created successfully');
            return res.send({
                success: true,
                message: 'Leadership created successfully'
            });
    
        } catch (error) {
            console.error('Error in Leadership API:', error);
            res.send({
                success: false,
                error: 'Error occurred: ' + error
            });
        }
    }],
    getLeadership: [mediaRestriction, async (req, res) => {
        try {
            // Construct SQL query to fetch all case studies
            const sql = `SELECT * FROM leadership`;
    
            // Execute query
            const [rows] = await pool.query(sql);
    
            // Check if any case studies exist
            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: 'No leadership found' });
            }
    
            // Add domainPath to each case study's image field
            const caseStudies = rows.map(row => ({
                ...row,
                image: domainPath  + row.image
            }));
    
            // Return all case study data
            res.json({ success: true, caseStudies });
        } catch (error) {
            console.error('Error in getLeadership API:', error);
            res.status(500).json({ success: false, error: 'Error occurred: ' + error.message });
        }
    }],
 }


 module.exports = controller;
