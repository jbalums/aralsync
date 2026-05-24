import "dotenv/config";
import http from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server as SocketIOServer } from "socket.io";

import { connectDB } from "./database/connection";
import { errorMiddleware } from "./middleware/error.middleware";
import { registerSyncHandlers } from "./websocket/syncHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { schoolRouter } from "./modules/schools/school.routes";
import { classLoadRouter } from "./modules/classLoads/classLoad.routes";
import { studentRouter } from "./modules/students/student.routes";
import { attendanceRouter } from "./modules/attendance/attendance.routes";
import { gradeEntryRouter } from "./modules/gradeEntries/gradeEntry.routes";
import { quarterlyGradeRouter } from "./modules/quarterlyGrades/quarterlyGrade.routes";
import { scheduleRouter } from "./modules/schedules/schedule.routes";
import { syncRouter } from "./modules/sync/sync.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";

const app = express();
const PORT = process.env.PORT ?? 5000;
const CLIENT_URL = ["http://localhost:5173", "http://localhost:4173"]; //process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/schools", schoolRouter);
app.use("/api/v1/class-loads", classLoadRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/grade-entries", gradeEntryRouter);
app.use("/api/v1/quarterly-grades", quarterlyGradeRouter);
app.use("/api/v1/schedules", scheduleRouter);
app.use("/api/v1/sync", syncRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use((_req, res) => {
	res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

const server = http.createServer(app);

const io = new SocketIOServer(server, {
	cors: {
		origin: CLIENT_URL,
		methods: ["*"],
	},
});

app.locals["io"] = io;
registerSyncHandlers(io);

async function bootstrap(): Promise<void> {
	await connectDB();
	server.listen(PORT, () => {
		console.log(`AralSync API running on port ${PORT}`);
	});
}

bootstrap().catch((err: unknown) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
