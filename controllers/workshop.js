const Workshop = require("../models/workshop");
const { successAction, failAction } = require("../utils/response");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");

exports.getWorkshop = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { wId } = req.params;
  Workshop.findById(wId).then((w) => {
    if (!w) {
      // console.log(err)
      return res.status(404).json({
        error: "Not Found! ",
      });
    }

    res.status(200).json({
      message: "get successfully",
      w,
    });
  });
};

exports.createWorkshop = (req, res) => {
  // console.log("clicked");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(208)
      .json({ isError: true, title: "Error", message: errors.array() });
  }

  if (!req.file) {
    return res
      .status(208)
      .json({ isError: true, title: "Error", message: "Image is not given" });
  }

  const {
    wsName,
    wsDesc,
    wLinkDrive,
    startDate,
    endDate,
    workshopMode,
    studentCoordinator,
  } = req.body;

  // return console.log(facultyCoordinator, studentCoordinator);
  let studentCoordinatorArr = studentCoordinator.split(",");

  Workshop.findOne({ workshopName: wsName }, (err, w) => {
    if (err) {
      return res
        .status(208)
        .json({ isError: true, title: "Error", message: err });
    }
    if (w) {
      const pathImg = "upload/images/" + req.file.filename;
      fileHelper.deleteFiles(pathImg);
      return res.status(422).json({
        isError: true,
        title: "Error",
        message: "Workshop already exists",
      });
    } else {
      const w1 = new Workshop({
        workshopName: wsName,
        wsDesc: wsDesc,
        startDate: startDate,
        wDriveLink: wLinkDrive,
        endDate: endDate,
        workshopMode: workshopMode,
        studentCoordinator: studentCoordinatorArr,
        photo: req.file.filename,
      });
      //   console.log(w1);
      try {
        w1.save((err, w1) => {
          if (err || !w1) {
            return res
              .status(208)
              .json({ isError: true, title: "Error", message: err });
          } else {
            return res.status(201).json({
              isError: false,
              title: "Success",
              message: "Workshp created!",
              workshop: w1,
            });
            //  console.log("success");
          }
        });
      } catch (err) {
        return res
          .status(208)
          .json({ isError: true, title: "Error", message: err });
      }
    }
  });
};

exports.getAllWokshop = (req, res) => {
  Workshop.find()
    .populate("studentCoordinator", [
      "coordinatorName",
      "coordinatorEmail",
      "coordinatorPhone",
      "photo",
    ])
    .exec((err, w) => {
      if (err || !w) {
        return res.status(208).json({
          message: "Page not found! ",
        });
      }
      res
        .status(200)
        .json({ isError: true, title: "Error", message: "fetched", data: w });
      // console.log(c)
    });
};

exports.deleteWorkshop = (req, res) => {
  const wId = req.params.wId;

  Workshop.findByIdAndDelete(wId)
    .then((result) => {
      if (!result) {
        res.status(208).json({
          isError: true,
          title: "Error",
          message: "Image is not given",
        });
      }
      const pathImg = "upload/images/" + result.photo;
      if (fs.existsSync(pathImg)) {
        fileHelper.deleteFiles(pathImg);
      } //photo exists

      res.status(208).json({
        data: result,
        statusCode: 410,
        message: "successfully deleted! ",
      });
    })
    .catch((err) => {
      failAction("Not found! ");
    });
};
