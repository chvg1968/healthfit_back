const validation = (schema) => {
  const func = (req, res, next) => {
    const { error } = schema.validate(req.body);
    console.log(error);
    if (error) {
      error.status = 400;
      next(error);
      return;
    }
    next();
  };
  return func;
};

module.exports = validation;
