import { existsSync, unlinkSync } from "fs";

export async function deleteFileByPath(filePath: string) {
  if (await existsSync(filePath)) {
    unlinkSync(filePath);
  }
}
