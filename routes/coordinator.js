const express = require("express");
const path = require("path");
const multer = require("multer");
const upload = require("../utils/upload");
const { check, body } = require("express-validator");
const coordinatorController = require("../controllers/coordinator");
const Coordinator = require("../models/coordinator");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

//GET, PUT, POST localhost:4000/api/coordinator
router.post(
  "/creating",
  isAuth,
  isAdmin,
  [body("coordinatorType").trim().toLowerCase()],
  upload.single("coordinator"),
  coordinatorController.createCoordinator
);
router.get(
  "/get/:cid",
  isAuth,
  [check("cid", "Id should be proper").isLength({ min: 24 })],

  coordinatorController.getCoordinatorById
);

router.get(
  "/get-all-details",
  isAuth,
  isAdmin,
  coordinatorController.getAllDetailsCoordinator
);
router.get("/getStudetntCoordniator", coordinatorController.getStudentCo);
router.get("/getFacultyCoordniator", coordinatorController.getFacultyCo);

router.put(
  "/update/:cid",
  isAuth,
  isAdmin,
  [check("cid", "Id should be proper").isLength({ min: 24 })],
  upload.single("coordinator"),
  coordinatorController.updateCoordinator
);
router.delete(
  "/delete/:cid",
  isAuth,
  isAdmin,
  [check("cid", "Id should be proper").isLength({ min: 24 })],
  coordinatorController.deleteCoordinator
);

// router.post("/img", upload.single("lola"), coordinatorController.imagePost);

module.exports = router;
