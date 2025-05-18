import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "proj_hjxpfwzaupuobrxntaed", // ✅ Use the real client ID here
  apiKey: process.env.TRIGGER_API_KEY!,
});
