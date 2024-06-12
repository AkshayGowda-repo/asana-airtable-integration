# Asana to Airtable Integration Service

This project sets up a service that integrates Asana with Airtable, copying new tasks from Asana to Airtable using webhooks.

## Setup

1. **Clone the Project Directory:**

   ```bash
   https://github.com/AkshayGowda-repo/asana-airtable-integration
   ```

2. **Install dependencies**

   ```sh
        npm install express body-parser axios dotenv
   ```

3. **Add the following content to the .env file:**
   ```sh
    ASANA_PAT= your_asana_personal_access_token
    AIRTABLE_API_KEY= your_airtable_api_key
    AIRTABLE_BASE_ID= your_airtable_base_id
   ```
4. **Start the Node.js service.**

```sh
node server.js
```

5. **Use a tool like Postman or cURL to test the Setup**

```sh
curl -X POST https://app.asana.com/api/1.0/webhooks \
  -H "Authorization: Bearer your_asana_personal_access_token" \
  -d "resource=your_project_id" \
  -d "target=https://your_server_url/webhook"

```

6. Use the following sample JSON body

```sh
{
  "events": [
    {
      "action": "added",
      "resource": "678901234567890",  // Replace with a valid task ID
      "parent": null,
      "created_at": "2024-06-12T12:34:56.789Z",
      "user": {
        "gid": "1111111111",
        "resource_type": "user",
        "name": "HelloHell"
      },
      "resource_type": "task"
    }
  ]
}
```
