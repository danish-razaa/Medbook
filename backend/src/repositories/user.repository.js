const { User } = require('../models');

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const findById = async (id) => {
  return User.findByPk(id, {
    attributes: { exclude: ['password', 'refresh_token'] },
  });
};

const findByIdWithPassword = async (id) => {
  return User.findByPk(id);
};

const create = async (data) => {
  return User.create(data);
};

const update = async (id, data) => {
  const [, [updated]] = await User.update(data, {
    where: { id },
    returning: true,
  });
  return updated;
};

const findAll = async (filters = {}) => {
  return User.findAll({
    where: filters,
    attributes: { exclude: ['password', 'refresh_token'] },
    order: [['created_at', 'DESC']],
  });
};

const updateRefreshToken = async (id, refreshToken) => {
  return User.update({ refresh_token: refreshToken }, { where: { id } });
};

module.exports = {
  findByEmail,
  findById,
  findByIdWithPassword,
  create,
  update,
  findAll,
  updateRefreshToken,
};
