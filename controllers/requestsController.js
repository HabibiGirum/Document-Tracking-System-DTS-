import fs from "fs";

import Request from "../models/Request.js";
import Department from "../models/Department.js";
import College from "../models/College.js";
import Vice_President from "../models/Vice_President.js";
import Human_resources from "../models/Human_resources.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import User from "../models/User.js";
import CustomAPIError from "../errors/custom-api.js";
import checkPermissions from "../utils/checkPermission.js";
import mongoose from "mongoose";
import {
  USER_FOLDER,
  DEPARTMENT_FOLDER,
  COLLEGE_FOLDER,
  VICE_PRESIENT_FOLDER,
  HUMAN_RESOURCE_FOLDER,
} from "../filePath.js";

const createRequest = async (req, res) => {
  const { DocumentType, purpose, To, file } = req.body;
  console.log( + "this is request body")
  console.log(To);
  if (!DocumentType || !purpose || !To) {
    throw new BadRequestError("Please Provide All Values");
  }

  const user = await User.findOne({ _id: req.user.userId });
  console.log(user.roll)
  req.body.by = user.name;
  req.body.from = user.department;
  
  req.body.createdBy = req.user.userId;
  req.body.filename = file;
  let Dep_request;
  let College_request;
  let request;
  let Vice_President_request;
  let HR_request;
  if (user.roll === "user" || To === "user") {
    request = await Request.create(req.body);

  }
  if (user.roll === "Department" || To === "Department") {
    Dep_request = await Department.create(req.body);
  }
  if (user.roll === "College" || To === "College") {
    College_request = await College.create(req.body);
  }
  if (user.roll === "vice president" || To === "vice president") {
    Vice_President_request = await Vice_President.create(req.body);
  }
  if (user.roll === "HR" || To === "HR") {
    HR_request = await Human_resources.create(req.body);
  }

      return res.status(StatusCodes.CREATED).json({
        request,
        Dep_request,
        College_request,
        Vice_President_request,
        HR_request,
      });
};

const getAllRequests = async (req, res) => {
  const request = req.baseUrl;
  const { search, DocumentType, sort, by } = req.query;

  /* 
  *************************************************
      select the field of the database to filter 
      and arrange out the data in the database
  *************************************************
  */
  let queryObject;
  if (request.includes("requests")) {
    queryObject = {
      createdBy: req.user.userId,
    };
  } else if (request.includes("departments")) {
    queryObject = {
      To: "Department",         
    };
  } else if (request.includes("college")) {
    queryObject = {
      To: "College",
    };
  } else if (request.includes("HR")) {
    queryObject = {
      To: "HR",
    };
  } else if (request.includes("vice_president")) {
    queryObject = {
      To: "vice president",
    };
  }
  if (search) {
    queryObject.by = { $regex: search, $options: "i" };
  }

  if (DocumentType !== "all") {
    queryObject.DocumentType = DocumentType;
  }

  /* 
  ************************************************
        classifying the database access base on 
        the requested database
  ************************************************
  */
  let result;
  if (request.includes("departments")) {
    result = Department.find(queryObject);
  } else if (request.includes("college")) {
    result = College.find(queryObject);
  } else if (request.includes("HR")) {
    result = Human_resources.find(queryObject);
  } else if (request.includes("vice_president")) {
    result = Vice_President.find(queryObject);
  } else if (request.includes("requests")) {
    result = Request.find(queryObject);
  }
  if (sort === "latest") {
    // chain sort conditions
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("To");
  }
  if (sort === "z-a") {
    result = result.sort("-To");
  }

  // const totalRequests =await result;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit; //10

  result = result.skip(skip).limit(limit);

  const requests = await result;
  const totalRequests = await Request.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalRequests / limit);
  console.log(requests);
  res
    .status(StatusCodes.OK)
    .json({ requests, totalRequests: requests.length, numOfPages: 1 });
};

const updateRequest = async (req, res) => {
  const { id: requestId } = req.params;

  const { DocumentType, To, purpose } = req.body;

  if (!purpose || !DocumentType || !To) {
    throw new BadRequestError("Please Provide All Values");
  }

  const request = await Request.findOne({ _id: requestId });

  if (!request) {
    throw new NotFoundError(`No Request with id ${requestId}`);
  }

  // check permissions W!
  console.log(typeof req.user.userId);
  console.log(typeof request.createdBy);
  checkPermissions(req.user, req.createdBy);

  const updatedRequest = await Request.findOneAndUpdate(
    { _id: requestId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(StatusCodes.OK).json({ updatedRequest });

  res.send("show states");
};

/*
 ************************************
 ** show status **
 ************************************
 */

const showStats = async (req, res) => {
  let stats = await Request.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: "$DocumentType",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    leave: stats.Leave || 0,
    Recruitment: stats.Recruitment || 0,
    Promotion: stats.Promotion || 0,
  };

  res.status(StatusCodes.OK).json({ defaultStats });
};

// const showStats=async(req,res)=>{
//     res.send('show states')
// }

const deleteRequest = async (req, res) => {
  const requests = req.baseUrl;
  let request;
  const { id: requestId } = req.params;
  console.log(req.baseUrl + "dele");
  if (requests.includes("departments")) {
    request = await Department.findOne({ _id: requestId });
  } else {
    request = await Request.findOne({ _id: requestId });
  }

  if (!request) {
    throw new NotFoundError(`No request with id : ${requestId}`);
  }

  checkPermissions(req.user, request.createdBy);

  await request.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! document removed" });
};

/* 
************************************
        ** openFile **
- handles the download of the file 
- fetches the filename and path of the request 
and sends it to the frotend
************************************
*/

const openFile = async (req, res) => {
  const { id: requestId } = req.params;
  const req_url = req.baseUrl;
  let request;
  let filePath;
  let filename;
  if (req_url.includes("requests")) {
    request = await Request.findOne({ _id: requestId });
    filename = request.filename;
    // Define the file path
    filePath = USER_FOLDER + filename;
  } else if (req_url.includes("departments")) {
    request = await Department.findOne({ _id: requestId });
    filename = request.filename;
    filePath = DEPARTMENT_FOLDER + filename;
  } else if (req_url.includes("college")) {
    request = await College.findOne({ _id: requestId });
    filename = request.filename;
    filePath = COLLEGE_FOLDER + filename;
  } else if (req.url.includes("HR")) {
    request = await Human_resources.findOne({ _id: requestId });
    filename = request.filename;
    filePath = HUMAN_RESOURCE_FOLDER + filename;
  } else if (req_url.includes("vice_president")) {
    request = await Human_resources.findOne({ _id: requestId });
    filename = request.filename;
    filePath = VICE_PRESIENT_FOLDER + filename;
  }

  console.log(request.filename);
  if (!request) {
    throw new NotFoundError(`No request with id : ${requestId}`);
  }

  checkPermissions(req.user, request.createdBy);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error reading PDF file");
    } else {
      res
        .set({
          "Content-Type": "application/pdf", //here you set the content type to pdf
          "Content-Disposition": "attachment; filename=" + filename, //if you change from inline to attachment if forces the file to download but inline displays the file on the browser
        })
        .send(data);
    }
  });
  // res.status(StatusCodes.OK).json({ msg: "Success! document found" });
};

export {
  createRequest,
  deleteRequest,
  getAllRequests,
  updateRequest,
  showStats,
  openFile,
};
