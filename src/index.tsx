import { setTimeout } from "node:timers/promises";
import { randomUUID } from "node:crypto";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { jsx } from "hono/jsx";
import { html } from "hono/html";
import { setCookie, deleteCookie } from "hono/cookie";

const app = new Hono();

const App = () => html`
  <!DOCTYPE html>
  <html lang="en">
    <body>
      <p>Hello World</p>
      <a href="/logout">Logout</a>
      <button onclick="doFetchSlow()">Click Me (slow)</button>
      <button onclick="doFetchFast()">Click Me (fast)</button>
      <script>
        async function doFetchSlow() {
          await fetch("/api/slow", { credentials: "include" });
          console.log("DONE slow request");
        }

        async function doFetchFast() {
          await fetch("/api/fast", { credentials: "include" });
          console.log("DONE fast request");
        }
      </script>
    </body>
  </html>
`;

const Complete = () => html`
  <!DOCTYPE html>
  <html lang="en">
    <body>
      <p>Logout Completed</p>
      <a href="/">Top</a>
    </body>
  </html>
`;

app.get("/", (c) => {
  return c.html(<App />);
});

app.get("/complete", (c) => {
  return c.html(<Complete />);
});

app.get("/logout", async (c) => {
  await setTimeout(1000);

  deleteCookie(c, "access-token", { path: "/" });

  return c.redirect("/complete");
});

app.get("/api/fast", async (c) => {
  await setTimeout(100);

  setCookie(c, "access-token", randomUUID(), { path: "/" });

  return c.json({ ok: true, wait: 100 });
});

app.get("/api/slow", async (c) => {
  await setTimeout(10000);

  setCookie(c, "access-token", randomUUID(), { path: "/" });

  return c.json({ ok: true, wait: 10_000 });
});

serve(app);
