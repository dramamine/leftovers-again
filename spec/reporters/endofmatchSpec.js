const fs = require('fs');
const EndOfMatch = require('@la/reporters/endofmatch');

const exampleState = [
  { won: true, myAlive: 6, yourAlive: 3, mine: [], yours: [] },
  { won: true, myAlive: 6, yourAlive: 0, mine: [], yours: [] },
  { won: false, myAlive: 0, yourAlive: 6, mine: [], yours: [] },
];

describe('matchstatus reporter', () => {
  it('should report as I expect', () => {
    spyOn(console, 'log');
    spyOn(fs, 'exists').and.returnValue(false);
    spyOn(fs, 'appendFile');
    const res = EndOfMatch.report(exampleState);
    expect(res).toBe(undefined);
  });
});
