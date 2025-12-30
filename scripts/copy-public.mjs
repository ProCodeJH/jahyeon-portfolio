import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const source = path.join(root, "dist", "public");
const target = path.join(root, "public");

async function ensurePublic() {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
  await fs.cp(source, target, { recursive: true });
}

ensurePublic().catch((error) => {
  console.error("Failed to copy dist/public to public", error);
  process.exit(1);
});
