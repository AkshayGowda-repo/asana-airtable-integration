require("dotenv").config();
var Airtable = require("airtable");

function dataToAirtable(taskId, name, assignee, dueDate, description) {
  var base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );
  base("Asana Tasks").create(
    [
      {
        fields: {
          "Task ID": taskId,
          Name: name,
          Assignee: assignee,
          "Due Date": dueDate,
          Description: description,
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records.forEach(function (record) {
        console.log(record.getId());
      });
    }
  );
}

module.exports = { dataToAirtable };
