const Contact = require("../model/contactModel");
const sendEmail = require("../utils/sendEmail");

// ── POST /api/contact ──
const submitContactEnquiry = async (req, res) => {
    try {
        const {
            title,
            firstName,
            lastName,
            email,
            telephone,
            preferredLanguage,
            natureOfEnquiry,
            country,
            subject,
            details,
            receiveUpdates,
            agreeToPolicy,
        } = req.body;

        if (!firstName || !lastName || !email || !natureOfEnquiry || !subject || !details) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields: firstName, lastName, email, natureOfEnquiry, subject, details.",
            });
        }

        const ipAddress =
            req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
            req.socket?.remoteAddress ||
            null;

        const newContact = await Contact.create({
            title,
            firstName,
            lastName,
            email,
            telephone,
            preferredLanguage,
            natureOfEnquiry,
            country,
            subject,
            details,
            receiveUpdates: receiveUpdates ?? false,
            agreeToPolicy: agreeToPolicy ?? false,
            ipAddress,
        });

        const adminEmailResult = await sendEmail({
            to: process.env.CONTACT_RECEIVER,
            subject: `New Contact Enquiry: ${subject}`,
            html: `
                <h2>New Contact Enquiry Received</h2>
                <p><strong>Name:</strong> ${title ? title + ". " : ""}${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${telephone || "N/A"}</p>
                <p><strong>Preferred Language:</strong> ${preferredLanguage || "N/A"}</p>
                <p><strong>Nature of Enquiry:</strong> ${natureOfEnquiry}</p>
                <p><strong>Country:</strong> ${country || "N/A"}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Details:</strong><br/>${details}</p>
                <p><strong>Receive Updates:</strong> ${receiveUpdates ? "Yes" : "No"}</p>
                <hr/>
                <p style="font-size:12px;color:#888;">IP: ${ipAddress || "N/A"}</p>
            `,
        });

        if (adminEmailResult.success) {
            console.log("📧 Contact admin email sent");
        } else {
            console.error("❌ Contact admin email failed:", adminEmailResult.error);
        }

        const customerEmailResult = await sendEmail({
            to: email,
            subject: "We've received your enquiry - Barosche",
            html: `
                <h2>Thank you for contacting Barosche</h2>
                <p>Hi ${firstName},</p>
                <p>We've received your enquiry regarding "<strong>${subject}</strong>" and our team will get back to you shortly.</p>
                <p>Best regards,<br/>Team Barosche</p>
            `,
        });

        if (customerEmailResult.success) {
            console.log("📧 Contact customer confirmation email sent");
        } else {
            console.error("❌ Contact customer confirmation email failed:", customerEmailResult.error);
        }

        return res.status(201).json({
            success: true,
            message: "Your enquiry has been submitted successfully. We'll get back to you soon!",
            data: newContact,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed.",
                errors,
            });
        }

        console.error("submitContactEnquiry error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
        });
    }
};

// ── GET /api/contact ──
const getAllEnquiries = async (req, res) => {
    try {
        const {
            status,
            page = 1,
            limit = 10,
            search,
            sortBy = "createdAt",
            order = "desc",
        } = req.query;

        const filter = {};

        if (status) {
            const validStatuses = ["pending", "read", "replied", "closed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `status must be one of: ${validStatuses.join(", ")}`,
                });
            }
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: "i" } },
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
            ];
        }

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;
        const sortOrder = order === "asc" ? 1 : -1;

        const allowedSortFields = ["createdAt", "updatedAt", "firstName", "lastName", "status"];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

        const [enquiries, total] = await Promise.all([
            Contact.find(filter)
                .sort({ [safeSortBy]: sortOrder })
                .skip(skip)
                .limit(limitNum)
                .select("-ipAddress"),
            Contact.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            message: "Enquiries fetched successfully",
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            data: enquiries,
        });
    } catch (error) {
        console.error("getAllEnquiries error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// ── GET /api/contact/:id ──
const getEnquiryById = async (req, res) => {
    try {
        const enquiry = await Contact.findById(req.params.id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Enquiry fetched successfully",
            data: enquiry,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID format.",
            });
        }

        console.error("getEnquiryById error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// ── PATCH /api/contact/:id/status ─────────────────────────────────────────
const updateEnquiryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "read", "replied", "closed"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(", ")}`,
            });
        }

        const updatedEnquiry = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedEnquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Enquiry status updated to "${status}" successfully.`,
            data: updatedEnquiry,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID format.",
            });
        }

        console.error("updateEnquiryStatus error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// ── DELETE /api/contact/:id ────────────────────────────────────────────────
const deleteEnquiry = async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully.",
            data: deleted,
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID format.",
            });
        }

        console.error("deleteEnquiry error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

// ── GET /api/contact/stats ─────────────────────────────────────────────────
const getEnquiryStats = async (req, res) => {
    try {
        const [stats, total] = await Promise.all([
            Contact.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Contact.countDocuments(),
        ]);

        const formatted = { total, pending: 0, read: 0, replied: 0, closed: 0 };
        stats.forEach((s) => {
            if (s._id in formatted) formatted[s._id] = s.count;
        });

        return res.status(200).json({
            success: true,
            message: "Enquiry stats fetched successfully",
            data: formatted,
        });
    } catch (error) {
        console.error("getEnquiryStats error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};

module.exports = {
    submitContactEnquiry,
    getAllEnquiries,
    getEnquiryById,
    updateEnquiryStatus,
    deleteEnquiry,
    getEnquiryStats,
};