const Joi = require('joi');

const updateUserValidation = (data) => {
    const schema = Joi.object({
      email: Joi.string().email().allow(null, ''), // Boş string veya null izin ver
      name: Joi.string().min(1).allow(null, ''), // Boş string veya null izin ver
      surname: Joi.string().min(1).allow(null, ''), // Boş string veya null izin ver
      phoneNumber: Joi.string().min(1).allow(null, ''), // Boş string veya null izin ver
      username: Joi.string().min(1).allow(null, '') // Boş string veya null izin ver
    }).min(1); // En az bir alanın dolu olması gerekiyor
  
    return schema.validate(data, { presence: 'required' }); // En az bir alan gereklidir
  };
  
  
  const userLocationUpdateValidation = (data) => {
    const schema = Joi.object({
      city: Joi.string().min(1).allow(null, ''),
      location: Joi.string().min(1).allow(null, ''),
      longitude: Joi.string().min(1).allow(null, ''),
      latitude: Joi.string().min(1).allow(null, '')
    }).min(1); // En az bir alanın gönderilmesi gerekiyor
  
    return schema.validate(data);
  };

  const updatePasswordValidation = (data) => {
    const schema = Joi.object({
      oldPassword: Joi.string().min(6).required(),
      newPassword: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'New passwords do not match.'
      })
    });
    return schema.validate(data);
  };
  

module.exports = {
    updateUserValidation,
    userLocationUpdateValidation,
    updatePasswordValidation
};
