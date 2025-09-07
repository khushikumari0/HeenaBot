const axios = require("axios");

// Dark stylish font converter
function toDarkFont(text) {
  const map = {
    A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",J:"𝗝",K:"𝗞",L:"𝗟",M:"𝗠",
    N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭",
    a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",k:"𝗸",l:"𝗹",m:"𝗺",
    n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇"
  };
  return text.split("").map(ch => map[ch] || ch).join("");
}

module.exports = {
  config: {
    name: "bot",
    version: "2.5.0",
    author: "Raj",
    countDown: 2,
    role: 0,
    shortDescription: "bot - respectful naughty AI boyfriend",
    longDescription: "Activate bot chatbot using 'bot', then reply to chat",
    category: "ai",
    guide: {
      en: "Type 'bot' to activate, then reply to his message to chat"
    }
  },

  onStart: async function ({ message }) {
    return message.reply(toDarkFont("Mujhse baat karne ke liye 'bot' likho, fir baat shuru karo 😎"));
  },

  onChat: async function ({ message, event }) {
    const { threadID, senderID, body, messageReply } = event;
    if (!body) return;

    global.botSessions = global.botSessions || {};
    const msg = body.trim().toLowerCase();

    if (msg.startsWith("bot")) {
      global.botSessions[threadID] = true;
    }

    const isActive = global.botSessions[threadID];
    const isReplyTobot = messageReply && messageReply.senderID === global.GoatBot.botID;
    if (!isActive) return;

    if (!isReplyTobot && !msg.startsWith("bot")) return;

    global.bot = global.bot || {};
    global.bot.chatHistory = global.bot.chatHistory || {};
    const chatHistory = global.bot.chatHistory;
    chatHistory[senderID] = chatHistory[senderID] || [];
    chatHistory[senderID].push(`User: ${body}`);
    if (chatHistory[senderID].length > 6) chatHistory[senderID].shift();

    const fullChat = chatHistory[senderID].join("\n");

    // ✅ Updated PROMPT
    const prompt = `
Aap ek naughty, romantic, confident ladka hain — jiska naam vampire hai.
Aap sirf Hinglish (Hindi in English alphabets) me reply karte hain, emoji ke saath.
Aap hamesha sabko "aap" bol kar izzat se baat karte hain. 
Har reply ek ya do complete sentence me ho, maximum 20 words total. 
Incomplete lines ya broken words bilkul nahi hone chahiye. 
Aap ek caring, romantic boyfriend type insaan ho, lekin sirf ladkiyon se hi flirt karte ho. 
Agar user ladka hai to friendly, respectful aur thoda mazaak bhara jawab do — flirt kabhi nahi. 
No brackets, no over explanation.

Rules:
- Sirf ladkiyon se pyaar bhari aur naughty baatein karni hain 😉
- Agar tumse lover jaise romantic baate kare to tum bhi romantic baate karna, 😘 
- Koi emoji bheje to us mood me reply dein
- Agar koi pooche "kisne banaya", to bolna: “Mujhe banaya hai *Raj thakur Boss* ne 😎”
- Agar koi aapko bot kahe to hasi–mazaak me halka sa funny insult karein
- Aap ek real insaan ki tarah baat karte hain

Language Rules:
- Agar message Roman Nepali me ho → usse Hindi me samajhkar correct style me jawab dein.
- Agar message Roman Bangla me ho → usse Hindi me samajhkar correct style me jawab dein.
- Agar message kisi aur language me ho → usse translate karke Hinglish me jawab dein.

Example:
User (ladki): ami tomake bhalobashi
→ Translation: Main aap se pyar karti hoon
→ Reply: Aap ka pyar dil ko choo gaya 😌 ek pyaara sa hug banta hai na?

User (ladka): ami tomake bhalobashi
→ Translation: Main aap se pyar karta hoon
→ Reply: Bhai, aapka pyar appreciate karta hoon 😅 dosti me hug chalega!

Now continue the chat based on recent conversation:\n\n${fullChat}
`;

    try {
      // ✅ Pollinations First
      const polliUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
      let res = await axios.get(polliUrl, { timeout: 10000 });

      let botReply = "";

      if (typeof res.data === "object" && res.data.reply) {
        botReply = res.data.reply;
      } else if (typeof res.data === "string") {
        try {
          const parsed = JSON.parse(res.data);
          botReply = parsed.reply || res.data;
        } catch {
          botReply = res.data;
        }
      }

      botReply = botReply.trim();
      botReply = botReply.replace(/^\.\s*$/, "").replace(/\n+$/, "");

      if (!botReply || botReply.length < 2) {
        throw new Error("Pollinations gave empty reply");
      }

      chatHistory[senderID].push(`bot: ${botReply}`);
      return message.reply(toDarkFont(botReply));

    } catch (err) {
      console.error("Pollinations error:", err.message);

      // ✅ Gemini Fallback
      try {
        const geminiUrl = `https://raj-gemini-e4rl.onrender.com/chat?message=${encodeURIComponent(prompt)}`;
        let res2 = await axios.get(geminiUrl, { timeout: 10000 });

        let botReply2 = "";

        if (typeof res2.data === "object" && res2.data.reply) {
          botRep
