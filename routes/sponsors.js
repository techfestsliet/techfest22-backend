const { check } = require("express-validator");
const {
  getAllSponsors,
  addSponsor,
  deleteSponsor,
} = require("../controllers/sponsors");
const isAdmin = require("../middleware/isAdmin");
const isAuth = require("../middleware/isAuth");
const upload = require("../utils/upload");

const router = require("express").Router();

router.get("/getAllSponsors", getAllSponsors);

router.post(
  "/addSponsor",
  isAuth,
  isAdmin,
  [
    check("name", "name is required").isEmpty(),
    check("link", "link is required"),
  ],
  upload.single("sponserImg"),
  addSponsor
);

router.delete("/delete/:sId", isAuth, isAdmin, deleteSponsor);

module.exports = router;
