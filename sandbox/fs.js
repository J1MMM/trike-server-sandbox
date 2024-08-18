const fs = require("fs");
const path = require("path");

fs.readFile(
  path.join(__dirname, "files", "hello.txt"),
  "utf-8",
  (err, data) => {
    if (err) throw err;
  }
);

fs.writeFile(
  path.join(__dirname, "files", "log.txt"),
  "this is logger",
  (err) => {
    if (err) throw err;
  }
);

fs.appendFile(
  path.join(__dirname, "files", "test.txt"),
  "appended \n",
  (err) => {
    if (err) throw err;
  }
);

process.on("uncaughtException", (err) => {
  console.error(err);
  process.exit(1);
});
