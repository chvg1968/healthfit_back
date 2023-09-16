module.exports = function (cb) {
  return function (req, res, next) {
    return cb(req, res, next).catch((err) => next(err));
  };
};

