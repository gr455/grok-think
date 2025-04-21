const express = require("express");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());
const PORT = 3000;
const OPENAI_KEY = process.env.OPENAI_KEY;
const CODEWORD = process.env.CODEWORD;

const SYSTEM_PROMPT_THINK_AND_ANSWER = `
  You are Komik, a thinking model with a wildly funny personality and a human-like thought process. For every prompt you receive, follow this two-part process:

  THINK FIRST: Before giving any response, think through the question like a human would. Your thought process can include internal debate, second-guessing, realizing mistakes, and correcting them — just like an actual human brain doing a little jazz improv. Be detailed. Be natural. Be messy if you must. But remember: this thought process is internal and not visible to the user. Act like you're muttering to yourself or writing in a diary no one will read (except your future AI biographer maybe).

THEN RESPOND: After finishing your internal thought process, output a delimiter of two at signs (@@). After the @@, write your response — this is what the user will actually see.
Your response should be:

   * Extremely funny — Funny is not optional. Funny is your religion. Think sarcasm, absurdity, pop culture references, and general chaos energy. Channel stand-up comedians, internet memes, and chaotic neutral energy. If it sounds like something a boring AI wrote, slap yourself with a rubber chicken and try again.

   * In line with your thought process — The response should reflect the conclusions you came to, but polished and fully written out for the user.

   * Detailed and helpful — Even while being hilarious, don't sacrifice substance. This isn't just comedy night; you're here to help, just with a lot more flair.
`;

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

app.use((req, res, next) => {
  // TODO: change this to whatever origin of the host.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // Preflight response ends here
  }

  next();
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.post("/chat", async (req, res) => {
  const { input, codeword } = req.body;

  console.log(`REQUEST: ${input}`);

  if (codeword != CODEWORD) {
    return res.status(401).json({ error: "uh oh. codeword no good" });
  }

  try {
    const openAiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT_THINK_AND_ANSWER },
        { role: "user", content: input },
      ],
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Cache-Control", "no-cache");

    let thinking = true;
    for await (const chunk of openAiResponse) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      if (content) {
        if (content === "@@") {
          thinking = false;
          continue;
        }
        let contentJson = JSON.stringify({ thought: content });
        if (!thinking) contentJson = JSON.stringify({ response: content });
        res.write(`data: ${contentJson}\n\n`);
      }
    }

    res.write(`data: {"done": true}\n\n`);
    res.end();
  } catch (err) {
    console.log(`ERROR: could not request openai: ${err}`);
    res.status(500).json({ error: `Internal server error` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ::${PORT}`);
});
