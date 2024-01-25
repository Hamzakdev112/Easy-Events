import express from "express";
const app = express();
import { EasyEvents } from "./easy-events";

const events = new EasyEvents({ adapter: "express", context: app });

const entries = [{ name: "entry1" }, { name: "entry2" }, { name: "entry3" }];

events.add("/event", (req, res) => {
  entries.forEach((entry) => {
    // / some task to exectute
    res.write(entry);
  });
});

app.get("/", (req, res) => {
  res.send("home");
});

app.listen(3001, () => {
  console.log("server listening");
});
