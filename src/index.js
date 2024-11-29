require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const db = require("./config/db");
const autoFindResultKQXSMB = require("./util/autoFindResultKQXSMB");
const autoFindResultKQXSMN = require("./util/autoFindResultKQXSMN");
const autoFindResultKQXSMT = require("./util/autoFindResultKQXSMT");
const chatBotTelegram = require("./util/chatBotTelegram");
const chatBotWhatsApp = require("./util/chatBotWhatsApp");

const app = express();

// // Connect to DB
db.connect();

const corsOptions = {
    //origin: "http://3.26.218.94",
    origin:
        process.env.NODE_ENV === "production"
            ? "http://3.26.218.94"
            : "http://localhost:3000",
    //origin: "https://7882-2402-800-63ad-dbeb-15dd-d7ec-bf16-b6c1.ngrok-free.app",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

app.use(cookieParser());
app.use(express.json({ limit: "10mb" })); // Tăng giới hạn lên 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors(corsOptions));
routes(app);

if(process.env.NODE_ENV === "production") {
    autoFindResultKQXSMB();
    autoFindResultKQXSMN();
    autoFindResultKQXSMT();

    chatBotTelegram();
}

chatBotWhatsApp(app);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
