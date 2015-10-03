import chat from '../src/chat';
import config from '../src/config';
import connection from '../src/connection';
import listener from '../src/listener';

describe('chat', () => {
  beforeEach( () => {
    spyOn(listener, 'subscribe').and.callFake( () => { return true; } );
  });

  it('should load chat', () => {
    expect(chat).toBeDefined();
  });

  describe('challengeOnJoin', () => {
    it('should challenge a single opponent', () => {
      spyOn(connection, 'send');
      config.nick = 'myself';
      config.battletype = 'battle';
      chat.challengeOnJoin(['2, myself, yourself']);

      expect(connection.send).toHaveBeenCalledWith('|/challenge yourself, battle');
    });
    it('should challenge multiple opponents', () => {
      spyOn(connection, 'send');
      config.nick = 'myself';
      config.battletype = 'battle';
      chat.challengeOnJoin(['3, myself, he, she']);

      expect(connection.send.calls.argsFor(0)[0]).toEqual('|/challenge he, battle');
      expect(connection.send.calls.argsFor(1)[0]).toEqual('|/challenge she, battle');
    });
    it('should give up if the data is weird', () => {
      spyOn(connection, 'send');
      config.nick = 'myself';
      config.battletype = 'battle';
      chat.challengeOnJoin(['343243249']);

      expect(connection.send).not.toHaveBeenCalled();
    });
  });

  describe('onUpdateUser', () => {
    it('should join the config chat room when we logged in successfully', () => {
      spyOn(connection, 'send');
      config.nick = 'myself';
      chat.onUpdateUser(['myself', '1']);
      expect(connection.send).toHaveBeenCalledWith('|/join lobby');
    });
    it('should not do anything if the status code isn\'t 1', () => {
      spyOn(connection, 'send');
      spyOn(console, 'error');
      config.nick = 'myself';
      const result = chat.onUpdateUser(['myself', '0']);
      expect(result).toBe(false);
      expect(connection.send).not.toHaveBeenCalled();
    });
    it('should not do anything if our nickname doesn\'t match', () => {
      spyOn(connection, 'send');
      spyOn(console, 'error');
      config.nick = 'myself';
      const result = chat.onUpdateUser(['someone-else', '1']);
      expect(result).toBe(false);
      expect(connection.send).not.toHaveBeenCalled();
    });
  });

  describe('acceptChallenges', () => {
    const challenges = JSON.stringify({
      challengesFrom: {
        'enemy': 'type1',
        'frenemy': 'type2',
        'friend': 'type2'
      }
    });

    it('should accept a single challenge', () => {
      spyOn(connection, 'send');
      config.battletype = 'type1';
      chat.acceptChallenges(challenges);
      expect(connection.send).toHaveBeenCalledWith('|/accept enemy');
    });

    it('should accept a multiple challenges', () => {
      spyOn(connection, 'send');
      config.battletype = 'type2';
      chat.acceptChallenges(challenges);
      expect(connection.send.calls.argsFor(0)[0]).toEqual('|/accept frenemy');
      expect(connection.send.calls.argsFor(1)[0]).toEqual('|/accept friend');
    });
  });
});

