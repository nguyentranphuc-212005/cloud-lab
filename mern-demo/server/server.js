require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 5000;

// Cho phép nhận dữ liệu JSON
app.use(express.json());

// Câu 35: Model Student
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

// Câu 36: GET danh sách sinh viên
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: "Loi khi lay danh sach sinh vien",
            error: error.message
        });
    }
});

// Câu 37: POST thêm sinh viên
app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);

        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({
            message: "Loi khi them sinh vien",
            error: error.message
        });
    }
});

// Câu 38: PUT cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Khong tim thay sinh vien"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({
            message: "Loi khi cap nhat sinh vien",
            error: error.message
        });
    }
});

// Câu 39: DELETE xóa sinh viên
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
        res.status(400).json({
            message: "Loi khi xoa sinh vien",
            error: error.message
        });
    }
});

async function startServer() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI chua duoc cau hinh trong file .env");
    }

    if (
        process.env.MONGODB_URI.includes("<cluster>") ||
        process.env.MONGODB_URI.includes("<username>")
    ) {
        throw new Error(
            "Hay thay URI mau trong .env bang Connection String that tu MongoDB Atlas"
        );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Da ket noi MongoDB Atlas");

    app.listen(PORT, () => {
        console.log(`Server dang chay tai http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Khong the khoi dong server:", error.message);
    process.exitCode = 1;
});