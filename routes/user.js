const { check } = require("express-validator");
const { hasPaymendSuccess } = require("../controllers/pay");
const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  pushEvent,
  pushWorkshop,
  getReferralCode,
  getVerifyUserWbe,
  addTeamMembersMail,
  otherCollegeUserPaidData,
  unenrolEvent,
} = require("../controllers/user");
const isAdmin = require("../middleware/isAdmin");
const isAuth = require("../middleware/isAuth");

const router = require("express").Router();

router.get("/allUsers", isAuth, isAdmin, getAllUsers);

router.get("/getUserById", isAuth, getUserById);

router.get(
  "/getUserByEmail",
  [check("email", "Email is required")],
  getUserByEmail
);

router.post("/updateUser", isAuth, updateUser);

router.post(
  "/pushEvent",
  isAuth,
  [check("event", "event is required")],
  pushEvent
);

router.get("/verify", getVerifyUserWbe);

router.post(
  "/pushWorkshop",

  isAuth,
  [check("workshop", "workshop is required")],
  pushWorkshop
);
router.post("/unenrolEvent", isAuth, unenrolEvent);
router.get("/referralCode", getReferralCode);
router.get(
  "/otherCollegePaidUserData",
  isAuth,
  isAdmin,
  otherCollegeUserPaidData
);
module.exports = router;
