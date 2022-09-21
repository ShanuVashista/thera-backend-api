import express from "express";
import cors from "cors";
import path from "path";
import methodOverride from "method-override";
import { config } from "dotenv";
import getConnection from "./db/connection";
import MessageModel from "./db/models/message.model";
import * as http from "http";
import * as socketio from "socket.io";
import Router from "./routes/index";

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

app.use("/", Router);

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
  // console.log("Connected: " + socket.userId);

  socket.on("disconnect", () => {
    console.log("chat is disconnected");
  });

  socket.on("joinRoom", ({ appointmentId }) => {
    socket.join(appointmentId);
    // console.log("A user joined chatroom: " + appointmentId);
  });

  socket.on("leaveRoom", ({ appointmentId }) => {
    socket.leave(appointmentId);
    // console.log("A user left chatroom: " + appointmentId);
  });

  // socket.on("sendMessage", async ({ appointmentId, userId, message }) => {
  //   if (message.trim().length > 0) {
  //     const user = await MessageModel.find({ appointmentId: appointmentId });

  //     const newMessage = new MessageModel({
  //       appointmentId: appointmentId,
  //       userId: userId,
  //       message: message,
  //     });
  //     io.to(appointmentId).emit("newMessage", {
  //       message,
  //       user,
  //     });
  //     await newMessage.save();
  //   }
  // });

  socket.on("sendMessage", async ({ appointmentId, userId, message }) => {
    if (message.trim().length > 0) {
      const user = await MessageModel.find({ appointmentId: appointmentId });

      const newMessage = new MessageModel({
        appointmentId: appointmentId,
        userId: userId,
        message: message,
      });
      io.to(appointmentId).emit("newMessage", {
        message,
        user,
      });
      await newMessage.save();

      socket.emit("message", {
        message,
        user,
      });
    }
  });

  socket.on("getChatMessage", async ({ appointmentId, userId }) => {
    const chatMessage = await MessageModel.find({
      appointmentId: appointmentId,
    });
    io.to(appointmentId).emit("chatMessage", {});
  });
});

server.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});
