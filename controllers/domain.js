const Domain = require("../models/domain");
const { validationResult } = require("express-validator");

const path = require("path");
const multer = require("multer");
const { json } = require("body-parser");
const { failAction, successAction } = require("../utils/response");
const fileHelper = require("../utils/file");

//creating domain

exports.createDomain = (req, res) => {
  // console.log(req.file);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(failAction(errors.array(), 422));
  }

  const { domainName, domainInfo, studentCoordinator, facultyCoordinator } =
    req.body;

  //const dn = req.body.domainName;
  //splitting through ,
  let studentCoordinatorArr = studentCoordinator.split(",");
  let facultyCoordinatorArr = facultyCoordinator.split(",");

  let domain = new Domain({
    domainName: domainName,
    domainInfo: domainInfo,
    studentCoordinator: studentCoordinatorArr,
    facultyCoordinator: facultyCoordinatorArr,
    photo: req.file.filename,
  });
  // console.log(domain)
  domain.save((err, domain) => {
    if (err) {
      //err
      console.log(err);
      return res.status(400).json({
        error: "error ocurd, no able to saved in db ",
      });
    }
    res.json({
      message: "domain created successfully! ",
      domain,
    });
  });
};

exports.getDomain = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const did = req.params.did;

  Domain.findById(did).then((d) => {
    if (!d) {
      // console.log(err)
      return res.status(404).json({
        error: "Not Found! ",
      });
    }

    res.status(200).json({
      message: "get successfully",
      d,
    });
  });
};

// exports.imagePost = (req, res) => {
//   const { domainName, domainInfo, studentCoordinator, facultyCoordinator } =
//     req.body;

//   //const dn = req.body.domainName;

//   // const errors = validationResult(req);
//   // if (!errors.isEmpty()) {
//   //   return res.status(422).send("sholdnt be empty");
//   // }

//   //splitting through ,
//   let studentCoordinatorArr = studentCoordinator.split(",");
//   let facultyCoordinatorArr = facultyCoordinator.split(",");

//   let domain = new Domain({
//     domainName: domainName,
//     domainInfo: domainInfo,
//     studentCoordinator: studentCoordinatorArr,
//     facultyCoordinator: facultyCoordinatorArr,
//     photo: req.file.filename,
//   });
//   // console.log(domain)
//   domain.save((err, domain) => {
//     if (err) {
//       //err
//       console.log(err);
//       return res.status(400).json({
//         error: "error ocurd, no able to saved in db ",
//       });
//     }
//     res.json({
//       message: "domain created successfully! ",
//       domain,
//     });
//   });
// };

exports.deleteDomain = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json(failAction(errors.array(), 422));
  }

  // errors.throw();

  console.log(req.params);
};
