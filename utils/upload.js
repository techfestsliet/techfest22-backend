//for uploading images

const path = require("path");
const multer = require("multer");

//disk storage
const storage = multer.diskStorage({
  destination: "./upload/images/",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//stored at localhost:4000/api/profile/${req.file.filename}
const upload = multer({
  storage: storage,
  fileFilter: filefilter,
});

module.exports = upload;
