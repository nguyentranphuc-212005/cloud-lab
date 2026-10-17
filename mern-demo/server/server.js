require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Trang chủ Backend
app.get("/", (req, res) => {
    res.send("Backend dang hoat dong!");
});

// Câu 58: Cấu hình CORS cho Production
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
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

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// Câu 44: Health Check cho Render
// Giữ JSON để Render kiểm tra HTTP 200
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        version: "2.0",
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Trang giao diện kiểm tra Backend
app.get("/status", (req, res) => {
    const uptime = Math.floor(process.uptime());
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    res.status(200).send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Backend API - Version 2.0</title>
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #0f172a, #1d4ed8);
                    color: #1e293b;
                }

                .card {
                    width: 100%;
                    max-width: 480px;
                    padding: 36px;
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 20px 50px #0003;
                }

                .icon {
                    font-size: 42px;
                }

                h1 {
                    margin-bottom: 8px;
                    color: #1d4ed8;
                }

                .subtitle {
                    color: #64748b;
                    margin-bottom: 28px;
                }

                .status {
                    display: inline-block;
                    padding: 10px 14px;
                    border-radius: 30px;
                    background: #dcfce7;
                    color: #15803d;
                    font-weight: bold;
                }

                .info {
                    margin-top: 26px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                }

                .info p {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 12px;
                }

                .info p:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .label {
                    color: #64748b;
                }

                .value {
                    font-weight: bold;
                    text-align: right;
                }

                .footer {
                    margin-top: 24px;
                    color: #94a3b8;
                    font-size: 12px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <main class="card">
                <div class="icon">🚀</div>
                <h1>Backend API</h1>
                <p class="subtitle">Hệ thống quản lý sinh viên</p>

                <div class="status">● Hệ thống đang hoạt động</div>

                <div class="info">
                    <p>
                        <span class="label">Trạng thái</span>
                        <span class="value">UP</span>
                    </p>
                    <p>
                        <span class="label">Phiên bản</span>
                        <span class="value">2.0</span>
                    </p>
                    <p>
                        <span class="label">Cơ sở dữ liệu</span>
                        <span class="value">MongoDB Atlas</span>
                    </p>
                    <p>
                        <span class="label">Thời gian hoạt động</span>
                        <span class="value">${hours}h ${minutes}m ${seconds}s</span>
                    </p>
                    <p>
                        <span class="label">Thời gian kiểm tra</span>
                        <span class="value">${new Date().toLocaleString("vi-VN")}</span>
                    </p>
                </div>

                <div class="footer">
                    Backend Service · Version 2.0
                </div>
            </main>
        </body>
        </html>
    `);
});

// GHI LOG REQUEST VÀ RESPONSE HTTP - KIỂM TRA CI/CD
app.use((req, res, next) => {
    const startTime = Date.now();

    console.log(
        `[CI/CD test] [REQUEST] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    res.on("finish", () => {
        console.log(
            `[CI/CD test] [RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - startTime}ms`
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
