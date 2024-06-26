require("dotenv").config();
const cors = require("cors");
const express = require("express");
const crypto = require("crypto");
const ngrok = require("@ngrok/ngrok");

const { getAsanaTask } = require("./fetch");
const { dataToAirtable } = require("./airtablePopulate");

const app = express();

app.use(express.json());
app.use(cors());

let secret = "";

let events = [];

app.post("/receiveWebhook", (req, res, next) => {
  if (req.headers["x-hook-secret"]) {
    console.log("This is a new webhook");
    secret = req.headers["x-hook-secret"];
    console.log(secret);
    res.setHeader("X-Hook-Secret", secret);
    res.sendStatus(200);
  } else if (req.headers["x-hook-signature"]) {
    const computedSignature = crypto
      .createHmac("SHA256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(req.headers["x-hook-signature"]),
        Buffer.from(computedSignature)
      )
    ) {
      // Fail
      res.sendStatus(401);
    } else {
      // Success

      console.log(`Events on ${Date()}:`);
      console.log(req.body.events);

      if (req.body.events.length > 0) {
        const taskId = req.body.events[0]["resource"]["gid"];

        console.log("events array>>>>>>>", events);
        getAsanaTask(taskId).then((task) => {
          console.log("task>>>>>>>>", task);
          let data_for_airtable = {};
          try {
            if (task) {
              console.log("Task details:", task.data);
              data_for_airtable["taskID"] = task.data["gid"];
              data_for_airtable["name"] = task.data["name"];
              data_for_airtable["assignee"] = task.data["assignee"]["name"];
              data_for_airtable["dueDate"] = task.data["due_on"];
              data_for_airtable["description"] = task.data["notes"];
            }

            if (!events.includes(taskId)) {
              console.log("airtable data>>>>>>", data_for_airtable);
              setTimeout(() => {
                dataToAirtable(
                  data_for_airtable["taskID"],
                  data_for_airtable["name"],
                  data_for_airtable["assignee"],
                  data_for_airtable["dueDate"],
                  data_for_airtable["description"]
                );
              }, 20000);
              events.push(taskId);
              console.log("events array after event loop>>>>>>>", events);
            }
          } catch (error) {
            console.error("Error:", error);
          }
        });
      }
      console.log(">>reached here");
      res.sendStatus(200);
    }
  } else {
    console.error("Something went wrong!");
  }
});

app.get("/", (req, res) => {
  res.send("Hi Akshay>> ");
});

// ngrok
//   .connect({ addr: 8080, authtoken_from_env: true })
//   .then((listener) => console.log(`Ingress established at: ${listener.url()}`));

app.listen(8080, () => {
  console.log(`Server started on port 8080.......`);
});
