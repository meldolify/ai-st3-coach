/**
 * Sessions service tests.
 *
 * Covers audit 2026-05-21 §LOW-06 at the behaviour level. The DELETE
 * /api/account integration calls terminateUserSessions; here we verify the
 * function actually tears down every entry owned by a given userId without
 * disturbing other users' sessions.
 */

process.env.NODE_ENV = 'test';

const { sessions, terminateUserSessions } = require('../src/services/sessions');

beforeEach(() => {
  sessions.clear();
});

function makeFakeSession(userId) {
  return {
    userId,
    ws: { terminate: jest.fn() },
    flux: { destroy: jest.fn() }
  };
}

describe('terminateUserSessions', () => {
  test('returns [] when no sessions belong to the user', () => {
    sessions.set('other_1', makeFakeSession('other-user'));
    expect(terminateUserSessions('test-user')).toEqual([]);
    expect(sessions.size).toBe(1);
  });

  test('tears down every session owned by the user (single match)', () => {
    const s = makeFakeSession('test-user');
    sessions.set('s_1', s);

    const terminated = terminateUserSessions('test-user');

    expect(terminated).toEqual(['s_1']);
    expect(sessions.has('s_1')).toBe(false);
    expect(s.flux.destroy).toHaveBeenCalledTimes(1);
    expect(s.ws.terminate).toHaveBeenCalledTimes(1);
  });

  test('tears down multiple sessions owned by the same user', () => {
    sessions.set('s_a', makeFakeSession('victim'));
    sessions.set('s_b', makeFakeSession('victim'));
    sessions.set('s_c', makeFakeSession('victim'));
    sessions.set('s_other', makeFakeSession('someone-else'));

    const terminated = terminateUserSessions('victim');

    expect(terminated.sort()).toEqual(['s_a', 's_b', 's_c']);
    expect(sessions.size).toBe(1);
    expect(sessions.has('s_other')).toBe(true);
  });

  test('does not touch sessions owned by other users', () => {
    const own = makeFakeSession('test-user');
    const other = makeFakeSession('other-user');
    sessions.set('own', own);
    sessions.set('other', other);

    terminateUserSessions('test-user');

    expect(other.ws.terminate).not.toHaveBeenCalled();
    expect(other.flux.destroy).not.toHaveBeenCalled();
    expect(sessions.has('other')).toBe(true);
  });

  test('flux.destroy throwing does not stop ws.terminate', () => {
    const s = {
      userId: 'test-user',
      ws: { terminate: jest.fn() },
      flux: {
        destroy: jest.fn(() => {
          throw new Error('already destroyed');
        })
      }
    };
    sessions.set('s', s);

    expect(() => terminateUserSessions('test-user')).not.toThrow();
    expect(s.ws.terminate).toHaveBeenCalled();
    expect(sessions.has('s')).toBe(false);
  });

  test('ws.terminate throwing does not stop sessions.delete', () => {
    const s = {
      userId: 'test-user',
      ws: {
        terminate: jest.fn(() => {
          throw new Error('socket closed');
        })
      },
      flux: { destroy: jest.fn() }
    };
    sessions.set('s', s);

    expect(() => terminateUserSessions('test-user')).not.toThrow();
    expect(sessions.has('s')).toBe(false);
  });

  test('handles sessions with missing ws or flux', () => {
    sessions.set('a', { userId: 'test-user' });
    sessions.set('b', { userId: 'test-user', ws: null });
    sessions.set('c', { userId: 'test-user', flux: undefined });

    expect(() => terminateUserSessions('test-user')).not.toThrow();
    expect(sessions.size).toBe(0);
  });

  test('falsy userId is a no-op (defence in depth)', () => {
    sessions.set('s', makeFakeSession('test-user'));
    expect(terminateUserSessions(null)).toEqual([]);
    expect(terminateUserSessions(undefined)).toEqual([]);
    expect(terminateUserSessions('')).toEqual([]);
    expect(sessions.size).toBe(1);
  });
});
