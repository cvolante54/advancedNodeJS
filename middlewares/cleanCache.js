const { clearHash } = require('../services/cache');

module.export = async (req, res, err) => {
  await next();

  clearHash(req.user.id);
}
