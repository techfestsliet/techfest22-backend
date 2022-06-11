const { validationResult } = require("express-validator");
const webTeam = require("../models/webTeam");

module.exports.addMember = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(201)
      .json({ isError: true, message: "Cannot add member" });
  }

  const { name, role, photo, phone } = req.body;

  const payLoad = {
    name: name,
    role: role,
    photo: photo,
    phone: phone,
  };

  const member = new webTeam(payLoad);

  member.save((err, member) => {
    if (err || !member) {
      return res
        .status(201)
        .json({
          isError: true,
          message: "Some error occurred! Please try again",
        });
    }
    return res
      .status(200)
      .json({ isError: false, message: "Member added successfully" });
  });
};
