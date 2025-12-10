import JZZ from 'jzz';
import JzzSynthTiny, { JZZSynthesizer, JZZWithTinySynth } from 'jzz-synth-tiny';

import { Channel } from './Channel';
import { Recorder } from './Recorder';

JzzSynthTiny(JZZ);

export class Synthesizer {
  recorder?: Recorder;
  channelSeed: number;
  channels: Array<Channel>;
  jzz: JZZSynthesizer | null;

  constructor(recorder?: Recorder) {
    this.recorder = recorder;
    // @ts-expect-error We have augmented JZZ with tiny synth at the top-level.
    this.jzz = (JZZ as JZZWithTinySynth).synth.Tiny();
    this.channelSeed = 0;
    this.channels = [];
  }

  getChannel(instrumentName: string) {
    if (!this.jzz) {
      throw new Error('This synthesizer is closed.');
    }

    const channelId = this.channelSeed++;
    const channel = new Channel(this.jzz.ch(channelId), channelId, instrumentName, this.recorder);
    this.channels.push(channel);

    return channel;
  }

  close() {
    if (!this.jzz) {
      return;
    }

    this.recorder?.onClose();

    this.channels.forEach((channel) => channel.close());
    this.channels = [];

    this.jzz.close();
    this.jzz = null;
  }
}
