const express = require("express");
const { check } = require("express-validator");
const upload = require("../utils/upload");

const Domain = require("../models/domain");
const domainController = require("../controllers/domain");
const router = express.Router();

router.post(
  "/creating",
  [
    check("domainName", "Domain name required!")
      .trim()
      .custom((value) => {
        return Domain.findOne({ domainName: value }).then((d) => {
          if (d) {
            throw new Error("Domain already exits!");
          }
        });
      }),
    check("domainInfo", "Domain Info required!"),
    check("studentCoordinator", "Student coordinator required!"),
    check("facultyCoordinator", "Faculty coordinator required!"),
  ],
  upload.single("domain"),
  domainController.createDomain
);

router.get(
  "/get-single/:did",
  [check("did", "Id should be proper").isLength({ min: 24 })],
  domainController.getDomain
);

router.delete(
  "/del/:wId",

  [
    check("wId", "Id should be proper").custom((value) => {
      if (value.length !== 12) {
        throw new Error("Id should be proper!");
      }
    }),
  ],
  domainController.deleteDomain
);
module.exports = router;
