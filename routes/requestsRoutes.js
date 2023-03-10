import express from "express";

const router = express.Router();

import {
  createRequest,
  deleteRequest,
  getAllRequests,
  updateRequest,
  showStats,
  openFile,
} from "../controllers/requestsController.js";

router.route("/").post(createRequest).get(getAllRequests);
// place before :id
router.route("/stats").get(showStats);

/* 
**************************************
 handle the route of all methods related to specific request id
**************************************
*/
router.route("/:id").delete(deleteRequest).patch(updateRequest).get(openFile);

export default router;
