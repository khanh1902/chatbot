const Authenticate = async (req, res, next) => {
    const { 'authorization-token': token } = req.headers;
    if (!token) {
      return next(res.status(401));
    };
    next();
  };

module.exports = {
    Authenticate
};
