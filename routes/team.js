const { check } = require("express-validator");

const {
  verifyParticipation,
  createTeam,
  addTeamMember,
  deleteTeam,
  addTeamMembersMail,
  getTeams,
  getProperTeams,
  getTeamById,
  getTeamWhomeLeader,
} = require("../controllers/team");
const isAdmin = require("../middleware/isAdmin");
const isAuth = require("../middleware/isAuth");
const router = require("express").Router();

router.post("/createTeam", isAuth, createTeam);

router.post("/addTeamMemberMail", isAuth, addTeamMember);
router.get("/getAllTeams", isAuth, isAdmin, getTeams);
router.get("/getTeams", isAuth, getProperTeams);
router.post("/deleteTeam", isAuth, deleteTeam);
router.get("/getTeamWhomeLeader", isAuth, getTeamWhomeLeader);
router.post("/teamById", getTeamById);

module.exports = router;
