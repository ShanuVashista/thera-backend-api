import { StatusCodes } from "http-status-codes";
import multer from "multer";
import path from "path";
import { ensureDir } from "fs-extra";

const storage = multer.diskStorage({
  //multers disk storage settings
  destination: async function (req, file, cb) {
    await ensureDir("./public/uploads/");
    cb(null, "./public/uploads/");
  },
  filename: function (req, file, cb) {
    const datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
      return callback(new Error("Only images are allowed"));
    }
    callback(null, true);
  },
}).single("profile_image");

export default function uploadFile(req, res, next) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: err.message,
      });
    }
    next();
  });
}
