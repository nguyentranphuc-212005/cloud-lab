const express = require("express");

const app = express();

const PORT = 5000;

app.get("/api/hello", (req, res) => {
    res.json({
        message: "Backend dang hoat dong"
    });
});

app.listen(PORT, () => {
    console.log(`Server dang chay tai http://localhost:${PORT}`);
});
