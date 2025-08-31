#cmd install xvideo.js const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "xxx",
    aliases: [],
    description: "Download and send random videos from xvideos API",
    usage: "{prefix}randomxvideos [page]",
    cooldown: 5,
    author: "Raj",
    role: 1 // बस यही जोड़ा है — ताकि सिर्फ़ bot admin ही चला सके
  },

  onStart: async function ({ message, event, args, prefix }) {
    try {
      const page = args[0] || 3000;
      const response = await axios.get(`https://betadash-api-swordslush-production.up.railway.app/xvideos?page=${page}`);
      const data = response.data.result;

      if (!data || data.length === 0) {
        return message.reply("कोई वीडियो नहीं मिला।");
      }

      // Randomly select a video from the list
      const randomIndex = Math.floor(Math.random() * data.length);
      const video = data[randomIndex];
      const videoUrl = video.videoUrl;
      const fileName = path.join(__dirname, "randomxvideo.mp4");

      // वीडियो डाउनलोड करो
      const videoStream = (await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      })).data;

      // फाइल में सेव करो
      const writer = fs.createWriteStream(fileName);
      videoStream.pipe(writer);

      writer.on('finish', () => {
        // डाउनलोड पूरा होने पर बोट से भेजो
        message.send({
          body: `**${video.title}**\n\nVideo Downloaded from XVideos API`,
          attachment: fs.createReadStream(fileName)
        });
      });

      writer.on('error', (err) => {
        console.error(err);
        message.reply("वीडियो डाउनलोड में दिक्कत आ गई।");
      });

    } catch (err) {
      console.error(err);
      message.reply("API से डेटा लाने में दिक्कत आ गई।");
    }
  }
};
