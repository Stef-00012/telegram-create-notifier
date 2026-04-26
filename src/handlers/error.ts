import type { NtfyMessageBody } from "@/types/ntfy-sh";
import axios from "axios";
import fs from "node:fs"
import path from "node:path";

const errorsDir = path.join(__dirname, "../errors");

process.on("uncaughtException", async (err) => {
	if (!fs.existsSync(errorsDir)) {
		fs.mkdirSync(errorsDir);
	}

	const now = new Date();
	const dateStr = now.toISOString().slice(0, 10);
	const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
	const timestamp = `${dateStr}_${timeStr}`;

	const errorMessage = `Event: uncaughtException\nName: ${err.name}\nMessage: ${err.message}\nStack trace:\n\n${err.stack}`;

	console.log(
		`\n\x1b[31m${errorMessage.split("\n").join("\n\x1b[31m")}\n\x1b[0m`,
	);

	const errorPath = path.join(errorsDir, `${timestamp}.txt`);

	fs.writeFileSync(errorPath, errorMessage);

	try {
		await sendNotification(`${process.env.NTFY_TOPIC}`, {
			priority: 4, // https://docs.ntfy.sh/publish/#message-priority
			title: "There was an error in the personal API",
			message: err.stack,
		})
	} catch(e) {
		console.error("Failed to send error notification (uncaughtException):", e);
	}
});

process.on("unhandledRejection", async (reason, _promise) => {
	if (!fs.existsSync(errorsDir)) {
		fs.mkdirSync(errorsDir);
	}

	const now = new Date();
	const dateStr = now.toISOString().slice(0, 10);
	const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
	const timestamp = `${dateStr}_${timeStr}`;

	const errorMessage = `Event: unhandledRejection\nReason:\n${reason}`;

	console.log(
		`\n\x1b[31m${errorMessage.split("\n").join("\n\x1b[31m")}\n\x1b[0m`,
	);

	const errorPath = path.join(errorsDir, `${timestamp}.txt`);

	fs.writeFileSync(errorPath, errorMessage);

	try {
		await sendNotification(`${process.env.NTFY_TOPIC}`, {
			priority: 4, // https://docs.ntfy.sh/publish/#message-priority
			title: "There was an error in the personal API",
			message: String(reason),
		});
	} catch(e) {
		console.error("Failed to send error notification (unhandledRejection):", e);
	}
});

export async function sendNotification(topic: string, data: NtfyMessageBody = {}) {
	console.log("a")
	if (!process.env.NTFY_URL || !process.env.NTFY_TOKEN || !process.env.NTFY_TOPIC) return;
	console.log("b")

    try {
		const r = await axios.post(`${process.env.NTFY_URL}`, {
			topic,
			...data
		}, {
			headers: {
				Authorization: `Bearer ${process.env.NTFY_TOKEN}`,
			}
		});

		console.log(r.data)
	} catch(e) {
		console.error("Failed to send error notification:", e);
	}
}