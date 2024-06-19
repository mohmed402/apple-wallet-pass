const express = require("express");
const fs = require("fs");
const path = require("path");
const { PKPass } = require("passkit-generator");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/create-pass", async (req, res) => {
  console.log("Received request to create pass");

  const userData = {
    serialNumber: "123456",
    points: 100,
  };

  try {
    console.log("Reading certificate files...");
    const wwdr = fs.readFileSync(
      path.join(__dirname, "Configs", "AppleWWDRCAG4.cer")
    );
    const signerCert = fs.readFileSync(
      path.join(__dirname, "Configs", "pass.com.scanme.scanme.p12")
    );
    const signerKey = path.join(
      __dirname,
      "Configs",
      "pass.com.scanme.scanme.p12"
    );

    console.log("Creating PKPass object...");
    const pass = new PKPass({
      model: path.join(__dirname, "passModels", "StoreCard.pass"),
      certificates: {
        wwdr,
        signerCert,
        signerKey: {
          keyFile: signerKey,
          passphrase: "12345", // Replace with your actual passphrase
        },
      },
    });

    console.log("Setting fields...");

    pass.fields = pass.fields || {};
    pass.fields.primary = pass.fields.primary || [];
    pass.fields.secondary = pass.fields.secondary || [];

    pass.fields.primary.push({
      key: "points",
      label: "Points",
      value: userData.points,
    });
    pass.fields.secondary.push({
      key: "serial",
      label: "Serial",
      value: userData.serialNumber,
    });

    console.log("Generating pass...");
    const stream = pass.getAsStream(); // Use getAsStream() method to get the pass as a stream
    console.log("Pass generated successfully");

    res.type("application/vnd.apple.pkpass");
    stream.pipe(res);
  } catch (error) {
    console.error("Error generating pass:", error);
    res
      .status(500)
      .send(`An error occurred while generating the pass: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
