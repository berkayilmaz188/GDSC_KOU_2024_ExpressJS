
// Joi validation hatalarını işleyen middleware
const validateRequest = (validationSchema) => {
  return (req, res, next) => {
    const { error } = validationSchema(req.body);
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(", ");
      return res.status(400).json({ error: errorMessage });
    }
    next();
  };
};

module.exports = validateRequest;

