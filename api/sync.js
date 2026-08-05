import Redis from "ioredis";

const TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid mix-ups

let client;
function getClient() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, connectTimeout: 5000 });
    client.on("error", () => {});
  }
  return client;
}

function genCode() {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export default async function handler(req, res) {
  try {
    const redis = getClient();
    if (req.method === "POST") {
      const payload = req.body;
      if (!payload) return res.status(400).json({ error: "Missing body" });
      let code = (payload.code || "").toUpperCase().trim();
      if (!/^[A-Z0-9]{6}$/.test(code)) {
        do { code = genCode(); } while (await redis.exists("sync:" + code));
      }
      await redis.set("sync:" + code, JSON.stringify(payload.characters || []), "EX", TTL_SECONDS);
      return res.status(200).json({ code });
    }
    if (req.method === "GET") {
      const code = String(req.query.code || "").toUpperCase().trim();
      if (!/^[A-Z0-9]{6}$/.test(code)) return res.status(400).json({ error: "Invalid code" });
      const data = await redis.get("sync:" + code);
      if (!data) return res.status(404).json({ error: "Code not found or expired" });
      return res.status(200).json({ characters: JSON.parse(data) });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: "Sync service unavailable" });
  }
}
