const User = require("../models/user");
module.exports = async (req, res, next) => {
  const adminId = req.userId;
  const admin = await User.findById(adminId);
  if (admin.role !== 569) {
    return res.json({
      isError: true,
      title: "Error",
      message: "Wrong",
    });
  }
  next();
};
