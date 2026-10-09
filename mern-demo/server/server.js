
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Câu 58: Cấu hình CORS cho Production
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép request không có Origin
        // hoặc Origin nằm trong danh sách cho phép
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error("CORS blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

// CORS phải được khai báo trước các API
app.use(cors(corsOptions));

// Xử lý request preflight OPTIONS trên Express 5
app.options(/.*/, cors(corsOptions));

// Cho phép nhận dữ liệu JSON
app.use(express.json());

// GHI LOG REQUEST VÀ RESPONSE HTTP
app.use((req, res, next) => {
    const startTime = Date.now();

    console.log(
        `[REQUEST] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    res.on("finish", () => {
        console.log(
            `[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - startTime}ms`
        );
    });

    next();
});

// Model Student
const studentSchema = new mongoose.Schema({
    studentId: String,
    name: String,
    email: String
});

const Student = mongoose.model("Student", studentSchema);

// API kiểm tra Backend
app.get("/api/hello", (req, res) => {
    res.json({
        message: "Backend dang hoat dong"
    });
});

// GET danh sách sinh viên
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error("Loi lay danh sach sinh vien:", error);

        res.status(500).json({
            message: "Loi khi lay danh sach sinh vien",
            error: error.message
        });
    }
});

// POST thêm sinh viên
app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        console.error("Loi them sinh vien:", error);

        res.status(400).json({
            message: "Loi khi them sinh vien",
            error: error.message
        });
    }
});

// PUT cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Khong tim thay sinh vien"
            });
        }

        res.json(student);
    } catch (error) {
        console.error("Loi cap nhat sinh vien:", error);

        res.status(400).json({
            message: "Loi khi cap nhat sinh vien",
            error: error.message
        });
    }
});

// DELETE xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Khong tim thay sinh vien"
            });
        }

        res.json({
            message: "Xoa sinh vien thanh cong",
            student: student
        });
    } catch (error) {
        console.error("Loi xoa sinh vien:", error);

        res.status(400).json({
            message: "Loi khi xoa sinh vien",
            error: error.message
        });
    }
});

// Khởi động Backend
async function startServer() {
    if (!process.env.MONGODB_URI) {
        throw new Error(
            "MONGODB_URI chua duoc cau hinh trong Environment"
        );
    }

    if (
        process.env.MONGODB_URI.includes("<cluster>") ||
        process.env.MONGODB_URI.includes("<username>")
    ) {
        throw new Error(
            "Hay thay URI mau bang Connection String that tu MongoDB Atlas"
        );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Da ket noi MongoDB Atlas");

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server dang chay tren port ${PORT}`);
        console.log("CORS allowed origins:", allowedOrigins);
    });
}

startServer().catch((error) => {
    console.error("Khong the khoi dong server:", error.message);
    process.exit(1);
});