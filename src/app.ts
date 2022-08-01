import express from "express";
import cors from "cors";
import path from "path";
import methodOverride from "method-override";
import { config } from "dotenv";
import getConnection from "./db/connection";
import MessageModel from "./db/models/message.model";
import UserModel from "./db/models/user";
import * as http from "http";
import * as socketio from "socket.io";
import jwt from "jsonwebtoken";

config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(methodOverride("X-HTTP-Method-Override"));

//DATABASE CONNECTION
app.use(getConnection);
app.use("/public", express.static("./public"));
//View Engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
//ROUTES
import userRoutes from "./routes/userRoute";
import appointment from "./routes/appointment";
import rating from "./routes/rating";
import clinicalNote from "./routes/clinicalNote";
import referral from "./routes/referral";
import template from "./routes/template";
import CountryStateCity from "./routes/country_state_city";
import Organization from "./routes/organization.route";
import Call from "./routes/call.route";
import Activity from "./routes/activity.route";
import Symtoms from "./routes/symtoms.route";
import Message from "./routes/message.route";
import Video from "./routes/video.route";
// import Goals from "./routes/goals.route";
import NewGoals from "./routes/newGoal.route";
import Chat from "./routes/chat.route";

app.use("/user", userRoutes);
app.use("/appointments", appointment);
app.use("/rating", rating);
app.use("/clinicalNote", clinicalNote);
app.use("/referral", referral);
app.use("/template", template);
app.use("/get", CountryStateCity);
app.use("/organization", Organization);
app.use("/call", Call);
app.use("/activity", Activity);
app.use("/symtoms", Symtoms);
app.use("/message", Message);
app.use("/video", Video);
app.use("/goal", NewGoals);
app.use("/chat", Chat);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new socketio.Server(server, {
  allowEIO3: true,
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData.fullname);
    socket.emit("connected");
    console.log("Connected: ");
  });

  socket.on("disconnect", () => {
    // console.log("Disconnected: " + socket.userId);
  });

  socket.on("joinRoom", ({ appointmentId }) => {
    socket.join(appointmentId);
    console.log("A user joined chatroom: " + appointmentId);
  });

  socket.on("leaveRoom", ({ appointmentId }) => {
    socket.leave(appointmentId);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("sendMessage", async (data) => {
    const appointmentId = data.appointmentId;

    socket.emit("message", `A new user, ${Date.now()}, has connected`);

    socket.in(appointmentId).emit("newMessage", data);
    // socket.to(appointmentId).emit("newMessage", data);
  });
});

server.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});
