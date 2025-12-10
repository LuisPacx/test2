import { Synthesizer } from '../synthesizer/Synthesizer';
import { Track } from '../types';
import { PlayerInterface } from './playerInterface';

export function player(synthesizer: Synthesizer, tracks: ReadonlyArray<Track>): PlayerInterface;
