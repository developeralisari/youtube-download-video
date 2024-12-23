const ytdl = require('youtube-dl-exec');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const sanitize = require('sanitize-filename'); // Dosya adlarında geçerli olmayan karakterleri temizlemek için

// FFmpeg'in yolunu ayarlayın
ffmpeg.setFfmpegPath(ffmpegPath);

// YouTube Shorts URL'si
const videoUrl = 'https://www.youtube.com/shorts/iE9uxC0mdOg';

// Video başlığını almak için video URL'sinden meta bilgilerini alın
ytdl(videoUrl, {
  dumpSingleJson: true, // JSON formatında video bilgisi alın
}).then((info) => {
  const videoTitle = sanitize(info.title); // Başlığı al ve geçerli dosya adı yapmak için sanitize et

  // Video ve ses dosyalarını indirilecek yollar
  const videoFilePath = path.resolve(`${videoTitle}_video.mp4`);  // Video dosyasının adı başlıkla
  const audioFilePath = path.resolve(`${videoTitle}_audio.webm`); // Ses dosyasının adı başlıkla

  // Video dosyasını indir
  ytdl(videoUrl, {
    output: videoFilePath,
    format: 'bestvideo', // En iyi video kalitesini al
  }).then(() => {
    console.log('Video başarıyla indirildi!');

    // Ses dosyasını indir
    ytdl(videoUrl, {
      output: audioFilePath,
      format: 'bestaudio', // En iyi ses kalitesini al
    }).then(() => {
      console.log('Ses başarıyla indirildi!');

      // Video ve ses dosyalarını FFmpeg ile birleştirme
      ffmpeg()
        .input(videoFilePath)  // Video dosyasını input olarak ekle
        .input(audioFilePath)  // Ses dosyasını input olarak ekle
        .output(`${videoTitle}_final_video.mp4`)  // Çıktı dosyasının adı başlıkla
        .on('end', () => {
          console.log('Video ve ses başarıyla birleştirildi!');
          // Geçici dosyaları silmek için
          fs.unlinkSync(videoFilePath);
          fs.unlinkSync(audioFilePath);
        })
        .on('error', (err) => {
          console.error('Birleştirme hatası:', err);
        })
        .run();
    }).catch((err) => {
      console.error('Ses indirme hatası:', err);
    });

  }).catch((err) => {
    console.error('Video indirme hatası:', err);
  });
}).catch((err) => {
  console.error('Video bilgisi alınamadı:', err);
});
