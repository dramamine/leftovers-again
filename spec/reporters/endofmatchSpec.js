const exampleState = [
  {won: true, myAlive: 6, yourAlive: 3},
  {won: true, myAlive: 6, yourAlive: 0},
  {won: false, myAlive: 0, yourAlive: 6},
];
import EndOfMatch from 'reporters/endofmatch';

fdescribe('matchstatus reporter', () => {
  it('should report as I expect', () => {
    spyOn(console, 'log');
    const res = EndOfMatch.report(exampleState);
    expect(res).toBe(undefined);
  });
});
