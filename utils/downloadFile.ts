export function downloadFile(url, cb) {
  let req = new XMLHttpRequest();
  req.open('get', url);
  req.responseType = "arraybuffer";
  req.onreadystatechange = () => {
    if (req.readyState == 4 && req.status == 200) {
      this.ctx.decodeAudioData(req.response, audioBuffer => {
        cb(audioBuffer);
      });
    }
  };
  req.send();
}