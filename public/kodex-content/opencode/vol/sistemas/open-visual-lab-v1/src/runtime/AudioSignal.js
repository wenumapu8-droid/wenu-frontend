export class AudioSignal {
  constructor() {
    this.context = null;
    this.analyser = null;
    this.source = null;
    this.data = null;
    this.stream = null;
    this.enabled = false;
  }

  async enableMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone capture is not supported.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.smoothingTimeConstant = 0.82;

    this.source = this.context.createMediaStreamSource(
      this.stream,
    );
    this.source.connect(this.analyser);
    this.data = new Uint8Array(
      this.analyser.frequencyBinCount,
    );
    this.enabled = true;
  }

  average(start, end) {
    if (!this.data) return 0;

    let total = 0;
    let count = 0;
    const limit = Math.min(end, this.data.length);

    for (let i = start; i < limit; i += 1) {
      total += this.data[i];
      count += 1;
    }

    return count ? total / count / 255 : 0;
  }

  read(time = 0) {
    if (!this.enabled || !this.analyser || !this.data) {
      return [
        0.08 + 0.04 * Math.sin(time * 0.7),
        0.05 + 0.03 * Math.sin(time * 1.1 + 1.4),
        0.025 + 0.02 * Math.sin(time * 1.9 + 2.2),
      ];
    }

    this.analyser.getByteFrequencyData(this.data);

    return [
      this.average(1, 18),
      this.average(18, 90),
      this.average(90, 260),
    ];
  }

  async disable() {
    this.enabled = false;

    this.stream?.getTracks().forEach((track) => {
      track.stop();
    });

    if (this.context) {
      await this.context.close();
    }

    this.context = null;
    this.analyser = null;
    this.source = null;
    this.data = null;
    this.stream = null;
  }
}
