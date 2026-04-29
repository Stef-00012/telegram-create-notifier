import fs from "node:fs"
import path from "node:path";

const dataDir = path.join(__dirname, "../ws_data");

export function saveData(data: string, filename: string) {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    const now = new Date();
	const dateStr = now.toISOString().slice(0, 10);
	const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
	const timestamp = `${dateStr}_${timeStr}`;

    const dataPath = path.join(dataDir, `${filename}_${timestamp}.json`);
    
    fs.writeFileSync(dataPath, data);
}