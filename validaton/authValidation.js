const Joi = require('joi');

// Kullanıcı Kaydı için Validation Şeması
const registerValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        username: Joi.string().required(),
        name: Joi.string().required(),
        surname: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        city: Joi.string().required(),
        location: Joi.string().required(),
        longitude: Joi.string().required(),
        latitude: Joi.string().required(),
        nameUnited: Joi.string().min(1).allow(null, '')
    });
    return schema.validate(data);
};

// Kullanıcı Girişi için Validation Şeması
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    return schema.validate(data);
};

const resendActivationEmailValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });
    return schema.validate(data);
};

const forgotPasswordValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    return schema.validate(data);
};

const resetPasswordValidation = (data) => {
    const schema = Joi.object({
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    return schema.validate(data);
};


module.exports = {
    registerValidation,
    resendActivationEmailValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
};
