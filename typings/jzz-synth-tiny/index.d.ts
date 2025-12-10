declare module 'jzz-synth-tiny' {
  import JZZ from 'jzz';

  export interface JZZSynthesizerChannelProgram {
    note(noteName: string, velocity: number): void;
    noteOff(noteName: string): void;
  }

  export interface JZZSynthesizerChannel {
    program(instrumentId: number): JZZSynthesizerChannelProgram;
  }

  export interface JZZSynthesizer {
    ch(channelId: number): JZZSynthesizerChannel;
    close(): void;
  }

  export interface JZZWithTinySynth {
    synth: {
      Tiny(): JZZSynthesizer;
    };
  }

  interface JZZSynthTiny {
    (jzz: typeof JZZ): void;
  }

  const jzzSynthTiny: JZZSynthTiny;
  export default jzzSynthTiny;
}
