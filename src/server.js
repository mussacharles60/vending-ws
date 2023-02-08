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
// import path from 'path';
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
io.sockets.on('error', (err) => {
    console.log('io.sockets: error', err);
});
io.on('connection', (socket) => {
    // console.log('a new client connected: connection id: ' + socket.id);
    // old API
    socket.on('user-join', (user) => {
        // console.log('user-join:', user);
        if (!user) {
            const callback = {
                success: false,
                error_message: 'Error no input',
            };
            // return user_callback to client
            io.to(socket.id).emit('user-join-callback', JSON.stringify(callback));
            return;
        }
        try {
            const userObj = JSON.parse(user);
            if (!userObj || !userObj.key || userObj.key !== api_key) {
                const callback = {
                    success: false,
                    error_message: 'Invalid API key',
                };
                // return user_callback to client
                io.to(socket.id).emit('user-join-callback', JSON.stringify(callback));
                return;
            }
            if (!userObj || !userObj.id) {
                const callback = {
                    success: false,
                    error_message: 'Invalid user id',
                };
                // return user_callback to client
                io.to(socket.id).emit('user-join-callback', JSON.stringify(callback));
                return;
            }
            // send user to all other clients (except the one that just connected)
            socket.broadcast.emit('user-join', user);
            // send user to the client that just connected
            const callback = { success: true };
            // return user_callback to client
            io.to(socket.id).emit('user-join-callback', JSON.stringify(callback));
        }
        catch (err) {
            console.log(err);
            const callback = {
                success: false,
                error_message: 'Internal error',
            };
            // return user_callback to client
            io.to(socket.id).emit('user-join-callback', JSON.stringify(callback));
        }
    });
    socket.on('device-join', (device) => {
        if (!device) {
            const callback = {
                success: false,
            };
            // return device_callback to client
            io.to(socket.id).emit('device-join-callback', JSON.stringify(callback));
            return;
        }
        try {
            const deviceObj = JSON.parse(device);
            if (!deviceObj || !deviceObj.id) {
                const callback = {
                    success: false,
                };
                // return device_callback to client
                io.to(socket.id).emit('device-join-callback', JSON.stringify(callback));
                return;
            }
            // send device to all other clients (except the one that just connected)
            socket.broadcast.emit('device-join', device);
            // send device to the client that just connected
            const callback = { success: true };
            // return device_callback to client
            io.to(socket.id).emit('device-join-callback', JSON.stringify(callback));
        }
        catch (err) {
            console.log(err);
            const callback = {
                success: false,
            };
            // return device_callback to client
            io.to(socket.id).emit('device-join-callback', JSON.stringify(callback));
        }
    });
    socket.on('user-command', (userCommand) => {
        socket.broadcast.emit('user-command', userCommand);
    });
    socket.on('device-reply', (deviceReply) => {
        socket.broadcast.emit('device-reply', deviceReply);
    });
    socket.on('user-leave', (user) => {
        socket.broadcast.emit('user-leave', user);
    });
    socket.on('device-leave', (data) => {
        socket.broadcast.emit('device-leave', data);
    });
    socket.on("device-activity", (data) => {
        socket.broadcast.emit("device-activity", data);
    });
    //////////////////////////////////////////
    // new API
    socket.on('dash-user-join', (user) => {
        if (!user) {
            const callback = {
                success: false,
                error_message: 'Error no input',
            };
            io.to(socket.id).emit('dash-user-join-callback', JSON.stringify(callback));
            return;
        }
        try {
            const obj = JSON.parse(user);
            if (!obj || !obj.key || obj.key !== api_key) {
                const callback = {
                    success: false,
                    error_message: 'Invalid API key',
                };
                io.to(socket.id).emit('dash-user-join-callback', JSON.stringify(callback));
                return;
            }
            if (!obj || !obj.id) {
                const callback = {
                    success: false,
                    error_message: 'Invalid user id',
                };
                io.to(socket.id).emit('dash-user-join-callback', JSON.stringify(callback));
                return;
            }
            obj.device_ids.forEach(device_id => {
                socket.broadcast.emit('dash-user-join-' + device_id, user);
            });
            const callback = { success: true };
            io.to(socket.id).emit('dash-user-join-callback', JSON.stringify(callback));
        }
        catch (err) {
            console.log(err);
            const callback = {
                success: false,
                error_message: 'Internal error',
            };
            io.to(socket.id).emit('dash-user-join-callback', JSON.stringify(callback));
        }
    });
    socket.on('dash-dev-join', (device) => {
        if (!device) {
            const callback = {
                success: false,
            };
            io.to(socket.id).emit('dash-dev-join-callback', JSON.stringify(callback));
            return;
        }
        try {
            const obj = JSON.parse(device);
            if (!obj || !obj.device_id) {
                const cb = {
                    success: false,
                };
                io.to(socket.id).emit('dash-dev-join-callback', JSON.stringify(cb));
                return;
            }
            socket.broadcast.emit('dash-dev-join-' + obj.device_id, device);
            const cb = { success: true };
            io.to(socket.id).emit('dash-dev-join-callback', JSON.stringify(cb));
        }
        catch (err) {
            console.log(err);
            const cb = {
                success: false,
            };
            io.to(socket.id).emit('dash-dev-join-callback', JSON.stringify(cb));
        }
    });
    socket.on('dash-user-command', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.client_id && obj.device_id) {
                socket.broadcast.emit('dash-user-command-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('dash-user-command', err);
        }
    });
    socket.on('dash-dev-reply', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id && obj.client_id) {
                socket.broadcast.emit('dash-dev-reply-' + obj.device_id + '-' + obj.client_id, data);
            }
        }
        catch (err) {
            console.error('dash-dev-reply', err);
        }
    });
    socket.on('dash-dev-activity', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id) {
                socket.broadcast.emit('dash-dev-activity-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('dash-dev-activity', err);
        }
    });
    socket.on('dash-dev-leave', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id) {
                socket.broadcast.emit('dash-dev-leave-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('dash-dev-leave', err);
        }
    });
    socket.on('dash-user-leave', (user) => {
        try {
            const obj = JSON.parse(user);
            if (!obj || !obj.key || obj.key !== api_key) {
                return;
            }
            if (!obj.id) {
                return;
            }
            // send user to all other clients (except the one that just connected)
            obj.device_ids.forEach(device_id => {
                socket.broadcast.emit('dash-user-leave-' + device_id, user);
            });
        }
        catch (err) {
            console.error('dash-user-leave', err);
        }
    });
    // shop
    socket.on('shop-shopper-join', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.client_id && obj.device_id) {
                socket.broadcast.emit('shop-shopper-join-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('shop-shopper-join', err);
        }
    });
    socket.on('shop-dev-data', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id && obj.client_id) {
                socket.broadcast.emit('shop-dev-data-' + obj.device_id + '-' + obj.client_id, data);
            }
        }
        catch (err) {
            console.error('shop-dev-data', err);
        }
    });
    socket.on('shop-shopper-req-dev', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.client_id && obj.device_id) {
                socket.broadcast.emit('shop-shopper-req-dev-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('shop-shopper-req-dev', err);
        }
    });
    socket.on('shop-dev-reply', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id && obj.client_id) {
                socket.broadcast.emit('shop-dev-reply-' + obj.device_id + '-' + obj.client_id, data);
            }
        }
        catch (err) {
            console.error('shop-dev-reply', err);
        }
    });
    socket.on('shop-shopper-req-cart', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.client_id && obj.device_id) {
                socket.broadcast.emit('shop-shopper-req-cart-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('shop-shopper-req-cart', err);
        }
    });
    socket.on('shop-dev-process', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id && obj.client_id) {
                socket.broadcast.emit('shop-dev-process-' + obj.device_id + '-' + obj.client_id, data);
            }
        }
        catch (err) {
            console.error('shop-dev-process', err);
        }
    });
    socket.on('shop-dev-leave', (data) => {
        if (!data) {
            return;
        }
        try {
            const obj = JSON.parse(data);
            if (obj && obj.device_id && obj.client_id) {
                socket.broadcast.emit('shop-dev-leave-' + obj.device_id, data);
            }
        }
        catch (err) {
            console.error('shop-dev-leave', err);
        }
    });
    //
    socket.on('disconnect', () => {
        // console.log('client disconnected: connection id: ' + socket.id);
        // socket.leave(socket.id); // TODO: check if this is necessary ?????
        socket.broadcast.emit('client-leave', JSON.stringify({ id: socket.id }));
    });
});
app.get('/', (_req, res) => {
    res.send('Imperial Innovations: Vending Machine Web Socket @ 2022\n\n https://imperialinnovations.co.tz\n\n https://imc.co.tz');
});
httpServer.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Vending ws is running on port ${port}.`);
});
//# sourceMappingURL=server.js.map