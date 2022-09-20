import { ensureDirSync, move } from "fs-extra";
import path from "path";

export async function saveFile(user, req) {
  if (!req.file) return;

  const userDir = path.resolve(`./public/uploads/${user._id}`);
  //ensure dir exists
  await ensureDirSync(userDir);
  // move the file to the folder
  const filePath = path.join(userDir, req.file.filename);
  await move(req.file.path, filePath);
}
