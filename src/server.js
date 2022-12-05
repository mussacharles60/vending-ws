"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
// import path from "path";
const app = (0, express_1.default)();
const port = process.env.PORT || 9000; // default port to listen
app.use((0, cors_1.default)({
    origin: '*',
    // credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// app.use(bodyParser.urlencoded({ extended: true }));+
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
    }
});
const api_key = 'axiopu45yru54piegh048yruht3wp';
io.sockets.on("error", (err) => {
    console.log("io.sockets: error", err);
});
io.on("connection", (socket) => {
    // console.log("a new client connected: connection id: " + socket.id);
    socket.on("user-join", (user) => {
        // console.log("user-join:", user);
        if (!user) {
            const callback = {
                success: false,
                error_message: "Error no input",
            };
            // return user_callback to client
            io.to(socket.id).emit("user-join-callback", JSON.stringify(callback));
            return;
        }
        try {
            const userObj = JSON.parse(user);
            if (!userObj || !userObj.key || userObj.key !== api_key) {
                const callback = {
                    success: false,
                    error_message: "Invalid API key",
                };
                // return user_callback to client
                io.to(socket.id).emit("user-join-callback", JSON.stringify(callback));
                return;
            }
            if (!userObj || !userObj.id) {
                const callback = {
                    success: false,
                    error_message: "Invalid user id",
                };
                // return user_callback to client
                io.to(socket.id).emit("user-join-callback", JSON.stringify(callback));
                return;
            }
            // send user to all other clients (except the one that just connected)
            socket.broadcast.emit("user-join", user);
            // send user to the client that just connected
            const callback = { success: true };
            // return user_callback to client
            io.to(socket.id).emit("user-join-callback", JSON.stringify(callback));
        }
        catch (err) {
            console.log(err);
            const callback = {
                success: false,
                error_message: "Internal error",
            };
            // return user_callback to client
            io.to(socket.id).emit("user-join-callback", JSON.stringify(callback));
        }
    });
    socket.on("device-join", (device) => {
        // console.log("device-join:", device);
        if (!device) {
            const callback = {
                success: false,
            };
            // return device_callback to client
            io.to(socket.id).emit("device-join-callback", JSON.stringify(callback));
            return;
        }
        try {
            const deviceObj = JSON.parse(device);
            if (!deviceObj || !deviceObj.id) {
                const callback = {
                    success: false,
                };
                // return device_callback to client
                io.to(socket.id).emit("device-join-callback", JSON.stringify(callback));
                return;
            }
            // send device to all other clients (except the one that just connected)
            socket.broadcast.emit("device-join", device);
            // send device to the client that just connected
            const callback = { success: true };
            // return device_callback to client
            io.to(socket.id).emit("device-join-callback", JSON.stringify(callback));
        }
        catch (err) {
            console.log(err);
            const callback = {
                success: false,
            };
            // return device_callback to client
            io.to(socket.id).emit("device-join-callback", JSON.stringify(callback));
        }
    });
    socket.on("user-command", (userCommand) => {
        // console.log("user-command:", userCommand);
        // send device command to all other clients (except the one that just sent it)
        socket.broadcast.emit("user-command", userCommand);
    });
    socket.on("device-reply", (deviceReply) => {
        // console.log("device-reply:", deviceReply);
        // send device command to all other clients (except the one that just sent it)
        socket.broadcast.emit("device-reply", deviceReply);
    });
   socket.on("device-activity", (deviceActivity) => {
        // console.log("device-activity:", deviceActivity);
        // send device command to all other clients (except the one that just sent it)
        socket.broadcast.emit("device-activity", deviceActivity);
    });
    socket.on("user-leave", (user) => {
        // console.log("user-leave:", user);
        // send user to all other clients (except the one that just left)
        socket.broadcast.emit("user-leave", user);
        // console.log("user left: " + user.id);
    });
    socket.on("device-leave", (device) => {
        // console.log("device-leave:", device);
        // send device to all other clients (except the one that just left)
        socket.broadcast.emit("device-leave", device);
        // console.log("device left: " + device.id);
    });
    socket.on("disconnect", () => {
        // console.log("client disconnected: connection id: " + socket.id);
        // socket.leave(socket.id); // TODO: check if this is necessary ?????
        socket.broadcast.emit("client-leave", JSON.stringify({ id: socket.id }));
    });
});
app.get("/", (_req, res) => {
    res.send('Imperial Innovations: Vending Machine Web Socket @ 2022\n\n https://imperialinnovations.co.tz\n\n https://imc.co.tz');
});
httpServer.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Vending ws is running on port ${port}.`);
});
//# sourceMappingURL=server.js.map