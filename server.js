require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const ASANA_PAT = process.env.ASANA_PAT;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "Asana Tasks";

// Endpoint to handle Asana webhook events
app.post("/webhook", async (req, res) => {
  const event = req.body.events[0];

  if (event.resource_type === "task" && event.action === "added") {
    const taskId = event.resource;

    // Fetch task details from Asana
    try {
      const taskResponse = await axios.get(
        `https://app.asana.com/api/1.0/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${ASANA_PAT}`,
          },
        }
      );

      const task = taskResponse.data.data;
      console.log(task);

      // Prepare data for Airtable
      const airtableData = {
        fields: {
          "Task ID": task.gid,
          Name: task.name,
          Assignee: task.assignee ? task.assignee.name : "Unassigned",
          "Due Date": task.due_on || "No Due Date",
          Description: task.notes || "No Description",
        },
      };

      // Create a new record in Airtable
      await axios.post(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
        airtableData,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).send("Task copied to Airtable");
    } catch (error) {
      console.error("Error copying task to Airtable:", error);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(200).send("Event ignored");
  }
});

// Endpoint to verify Asana webhook setup
app.head("/webhook", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
