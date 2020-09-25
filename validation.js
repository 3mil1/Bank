//VALIDATION
const Joi = require('joi');

// Register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .required(),

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

        repeat_password: Joi.ref('password'),

        access_token: [
            Joi.string(),
            Joi.number()
        ],

        email: Joi.string().min(5).required(),
    })
        .with('username', 'birth_year')
        .xor('password', 'access_token')
        .with('password', 'repeat_password');


    return schema.validate(data);
};

const loginValidation = (data) => {
    const schema = Joi.object({

        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

        access_token: [
            Joi.string(),
            Joi.number()
        ],

        email: Joi.string().min(5).required(),
    })
        .with('username', 'birth_year')
        .xor('password', 'access_token')


    return schema.validate(data);
}


module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;

