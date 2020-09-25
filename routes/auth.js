const router = require('express').Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {registerValidation, loginValidation} = require('../validation');

router.post('/users', async (req, res) => {
    const {error} = registerValidation(req.body);
    // Lest validate the data before we a user
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the user is already in database
    const emailExists = await User.findOne({email: req.body.email})
    if (emailExists) return res.status(400).send('Email alredy exist');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    });

    try {
        const savedUser = await user.save();
        res.send({user: user._id});
    } catch (err) {
        res.status(400).send(err);
    }

});

// LogIn
router.post('/session', async (req, res) => {
    const {error} = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // Checking if the email exists
    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).send("Email is not found");
    // Password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Password is incorrect");

    // Create and assign a token
    const token = jwt.sign({_id: user.id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);


})
// Bankaccount
module.exports = router;