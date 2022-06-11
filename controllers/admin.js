// const { aggregate } = require("../models/user");
const User = require("../models/user");

exports.tfdetails = async (req, res, next) => {
  const reg = await User.find().countDocuments();
  let institutions = await User.find({ institution: "sliet" }).countDocuments();
  res.status(200).json({
    registration: reg,
    slietians: institutions,
    institutions: 0,
  });
};
