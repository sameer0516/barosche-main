const express = require("express");
const router = express.Router();

const {
    submitContactEnquiry,
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus,
    deleteEnquiry,
    getEnquiryStats,
} = require("../controller/contactController");

router.post("/", submitContactEnquiry);

router.get("/stats", getEnquiryStats);

router.get("/", getAllEnquiries);

router.get("/:id", getEnquiryById);

router.patch("/:id/status", updateEnquiryStatus);

router.delete("/:id", deleteEnquiry);

module.exports = router;