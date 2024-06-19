const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const passDir = path.join(__dirname, "passModels", "StoreCard.pass");
const files = ["icon.png", "logo.png", "background.png", "pass.json"];

let manifest = {};

files.forEach((file) => {
  const filePath = path.join(passDir, file);
  const fileData = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha1").update(fileData).digest("hex");
  manifest[file] = hash;
});

fs.writeFileSync(
  path.join(passDir, "manifest.json"),
  JSON.stringify(manifest, null, 2)
);

console.log("Manifest generated successfully");
console.log(JSON.stringify(manifest, null, 2));
