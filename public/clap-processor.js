class ClapProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.energy = 0;
    this.peak = 0;
    this.sampleCount = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (output) output.fill(0);
    if (!input) return true;

    for (let index = 0; index < input.length; index += 1) {
      const sample = input[index];
      this.energy += sample * sample;
      this.peak = Math.max(this.peak, Math.abs(sample));
      this.sampleCount += 1;
    }

    if (this.sampleCount >= 512) {
      this.port.postMessage({
        peak: this.peak,
        rms: Math.sqrt(this.energy / this.sampleCount),
        time: currentTime,
      });
      this.energy = 0;
      this.peak = 0;
      this.sampleCount = 0;
    }
    return true;
  }
}

registerProcessor("clap-processor", ClapProcessor);
