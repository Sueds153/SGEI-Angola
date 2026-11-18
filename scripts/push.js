const { execSync } = require("child_process");
const path = require("path");

const repoDir = "c:\\Users\\Pagora\\OneDrive\\Desktop\\shein-intermediary-platform-angola";

try {
  const result = execSync("git push origin master", {
    cwd: repoDir,
    encoding: "utf8",
    timeout: 60000,
    env: { ...process.env },
  });
  console.log("PUSH OK:", result);
} catch (err) {
  console.error("PUSH ERROR:", err.stderr || err.message);
}
