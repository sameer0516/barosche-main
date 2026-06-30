const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            enum: ["mr", "ms", "mrs", "dr"],
            trim: true,
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            maxlength: [50, "First name cannot exceed 50 characters"],
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            maxlength: [50, "Last name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        telephone: {
            type: String,
            trim: true,
            match: [
                /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                "Please enter a valid telephone number",
            ],
        },
        preferredLanguage: {
            type: String,
            enum: ["english", "german"],
            default: "english",
        },
        natureOfEnquiry: {
            type: String,
            enum: ["general", "sales", "support"],
            required: [true, "Nature of enquiry is required"],
        },
        country: {
            type: String,
            enum: ["india", "germany", "usa"],
            default: "india",
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: [150, "Subject cannot exceed 150 characters"],
        },
        details: {
            type: String,
            required: [true, "Details are required"],
            trim: true,
            maxlength: [2000, "Details cannot exceed 2000 characters"],
        },
        receiveUpdates: {
            type: Boolean,
            default: false,
        },
        agreeToPolicy: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["pending", "read", "replied", "closed"],
            default: "pending",
        },
        ipAddress: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;