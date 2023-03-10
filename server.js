import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import multer from "multer";
dotenv.config();
import {
  USER_FOLDER,
  DEPARTMENT_FOLDER,
  COLLEGE_FOLDER,
  VICE_PRESIENT_FOLDER,
  HUMAN_RESOURCE_FOLDER,
} from "./filePath.js";

const app = express();
import "express-async-errors";
import morgan from "morgan";

// DB and authentication user
import connectDB from "./DB/connect.js";

// route
import authRouter from "./routes/authRoutes.js";
import requestsRouter from "./routes/requestsRoutes.js";

// middleware

import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";
import authenticateUser from "./middleware/auth.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(express.json());

/* 
********************************
 configration for multer
 includes path to the directry and 
 for filtering the document type
********************************
*/

/* 
*********************************************
  file filter function
*********************************************
*/
const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else {
    cb(new Error("Not a PDF File!!"), false);
  }
};

/* 
**********************************************
  path to store files of the user
**********************************************
*/
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, USER_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
/* 
*************************************************
  path to store the files sent to the department
*************************************************
*/
const departmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DEPARTMENT_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.originalname}`);
  },
});

const departmentUpload = multer({
  storage: departmentStorage,
  fileFilter: multerFilter,
});
/* 
**************************************************
  path to store files sent to the college
**************************************************
*/
const collegeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, COLLEGE_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.originalname}`);
  },
});

const collegeUpload = multer({
  storage: collegeStorage,
  fileFilter: multerFilter,
});
/* 
**************************************************
  path to store files sent to the vicepresident
**************************************************
*/
const VicePresidentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VICE_PRESIENT_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.originalname}`);
  },
});

const VicePresidentUpload = multer({
  storage: VicePresidentStorage,
  fileFilter: multerFilter,
});
/* 
**********************************************
  path to store files to the Human resources
**********************************************
*/

const humanResourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, HUMAN_RESOURCE_FOLDER);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${file.originalname}`);
  },
});

const humanResourceUpload = multer({
  storage: humanResourceStorage,
  fileFilter: multerFilter,
});

/* 
*****************************
Route for different user file upload
*****************************
*/
app.use("/api/v1/upload", upload.single("file"), (req, res) => {
  console.log(req.file);
});

app.use(
  "/api/v1/upload_department",
  departmentUpload.single("file"),
  (req, res) => {
    console.log(req.file + "department file upload at server.js");
    console.log(res + "server.js at department");
  }
);

app.use(
  "/api/v1/upload_college",
  collegeUpload.single("file"),
  (req, res) => {
    console.log(req.file);
  }
);

app.use(
  "/api/v1/upload_hr",
  humanResourceUpload.single("file"),
  (req, res) => {
    console.log(req.file);
  }
);

app.use(
  "/api/v1/upload_vicePresident",
  VicePresidentUpload.single("file"),
  (req, res) => {
    console.log(req.file);
  }
);

app.get("/", (req, res) => {
  res.send("Welcome! this is your server habibi");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/requests", authenticateUser, requestsRouter);
app.use("/api/v1/departments", authenticateUser, requestsRouter, (req, res) => {
  console.log(res);
  console.log(req.body);
});
app.use("/api/v1/college", authenticateUser, requestsRouter, (req, res)=> {
  return next(new Error('Some error message'));
});
app.use("/api/v1/HR", authenticateUser, requestsRouter);
app.use("/api/v1/vice_president", authenticateUser, requestsRouter, (req, res) => {
  console.log("hoe many times the request is sent")
});

// if not found the above route run notFoundMiddleWare
app.use(notFoundMiddleware);
//if error occure on existing route run errorHandlerMiddleware
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);

    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
