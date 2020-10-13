const router = require('express').Router();
const verify = require('./verifyToken.js');
const User = require('./model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { registerValidation, loginValidation } = require('./validation');

router.get('/', verify, (req, res) => {
    res.send(req.user);
})


router.post('/users', async (req, res) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Mail is already registered"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: "User created"
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: err.message
                                })
                            })
                    }
                })

            }
        })
});

// LogIn
router.post('/sessions', async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec()
    
    if (!user) {
        res.status(401).json({message: "User not found"})
        return
    }
    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
            res.status(401).json({
                message: "Auth failed"
            });
        }
        if (result) {
           const token = jwt.sign({
                userId: user.id
            }, process.env.TOKEN_SECRET,{
                expiresIn: "1h"
            }
            )
            return res.status(200).json({
                message: "auth successful",
                token: token
            });
        }
    })
})
// Logout
router.delete('/sessions', async (req, res, next) => {
    const user = await User.findOne({email: req.body.email}).exec();
    console.log(user);

    if(!user) {
        res.sendStatus(400).json({
            message: "User not found"
        })

    }
   
})
router.delete('/users/:userId', async (req, res, next) => {
    User.remove({ _id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted successfully"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

})
// Transactions
// Check Balance
router.get('/balance', async (req, res, next) => {

    const token = req.header("Authorization");
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        try {
            const id = decoded.userId;
            const user = await User.findOne({_id:id});
            const balance = user.balance;
            res.end("Your balance:" + balance);

        }catch (err) {
            res.status(400).json({
                err: err.message
            })

        }
      } catch(err) {
          res.status(401).json({
              message: err.message
          })
        // err
      }
})


module.exports = router;

