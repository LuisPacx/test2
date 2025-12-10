const colorMap: Record<string, string> = {
  F: '#6929c4',
  Fb: '#1192e8',
  G: '#005d5d',
  Gb: '#9f1853',
  A: '#fa4d56',
  Ab: '#570408',
  B: '#198038',
  Bb: '#002d9c',
  C: '#ee538b',
  Cb: '#b28600',
  D: '#009d9a',
  Db: '#012749',
  E: '#8a3800',
  Eb: '#a56eff'
};

export function noteToColor(name: string) {
  const results = /^([A-G]b?)\d$/.exec(name);
  const note = results?.[1];

  if (!note || !(note in colorMap)) {
    return 'rgb(0,0,0)';
  }

  return colorMap[note];
}
