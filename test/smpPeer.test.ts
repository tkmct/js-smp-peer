/**
 * NOTE: Mock `Peer` with `MockPeer` since peerjs doesn't work w/ nodejs.
 * Ref:
 *  - https://github.com/mhchia/peek-a-book/issues/2
 *  - https://github.com/peers/peerjs/issues/606
 * Error: "node_modules/peerjs/dist/peerjs.min.js:48 ERROR PeerJS:  Error: The current browser does not support WebRTC"
 */

import SMPPeer from '../src/smpPeer';

import {
  ServerFault,
  TimeoutError,
  ServerUnconnected,
} from '../src/exceptions';

import {
  MockPeer,
  MockPeerWrongID,
  MockPeerFakeSend,
  MockPeerErrorWhenRegiser,
} from './mock';

/**
 * NOTE: a reference to the mock class allows us to chnage the mock class
 *  on the fly.
 */
let mockPeerClass: typeof MockPeer = MockPeer;

function MockCtor(...args: any[]) {
  return new mockPeerClass(...args);
}

jest.mock('peerjs', () => {
  return MockCtor;
});

beforeEach(() => {
  // Set `MockPeer` as the mock peer class by default.
  mockPeerClass = MockPeer;
});

afterEach(() => {
  mockPeerClass.resetPeers();
});

describe('connectToPeerServer', () => {
  const secret = '123';
  const pid = 'pid';
  const amount = 100;

  test('succeeds', async () => {
    const peer = new SMPPeer(secret, amount, pid);
    // Register callbacks
    let isConnectedCalled = false;
    peer.on('connected', () => {
      isConnectedCalled = true;
    });
    await peer.connectToPeerServer();
    expect(isConnectedCalled).toBeTruthy();
  });

  test('fails when the peer server returns a different peer id', async () => {
    mockPeerClass = MockPeerWrongID;

    const peer = new SMPPeer(secret, amount, pid);
    await expect(peer.connectToPeerServer()).rejects.toThrowError(ServerFault);
  });
});

describe('error callback', () => {
  const secret = '123';
  const pid = 'pid';
  const amount = 100;

  test('An error is emitted when peerjs does so', async () => {
    mockPeerClass = MockPeerErrorWhenRegiser;

    const peer = new SMPPeer(secret, amount, pid);
    let isErrorCalled = false;
    peer.on('error', (error: string) => {
      isErrorCalled = true;
    });
    await peer.connectToPeerServer();
    expect(isErrorCalled).toBeTruthy();
  });
});

describe('disconnect', () => {
  const secret = '123';
  const pid = 'pid';
  const amount = 100;

  test('succeeds', async () => {
    const peer = new SMPPeer(secret, amount, pid);
    // Register callbacks
    let isDisconnectedCalled = false;
    peer.on('disconnected', () => {
      isDisconnectedCalled = true;
    });
    await peer.connectToPeerServer();
    expect(isDisconnectedCalled).toBeFalsy();
    peer.disconnect();
    expect(isDisconnectedCalled).toBeTruthy();
  });
});

describe('runSMP', () => {
  const params: [string, string, number, number][] = [
    ['1', '1', 100, 200],
    ['1', '1', 100, 90],
    ['1', '2', 100, 200],
  ];
  const expectedResults = [
    { result: true, negotiatedAmount: 100 },
    { result: true, negotiatedAmount: 90 },
    { result: false, negotiatedAmount: 0 },
  ];

  test('succeeds', async () => {
    for (const i in params) {
      const param = params[i];
      const expectedResult = expectedResults[i];
      const actual = await smp(param[0], param[1], param[2], param[3]);
      expect(actual).toEqual(expectedResult);
    }
  });

  test('incoming callback', async () => {
    let isAliceCalled = false;
    let isBobCalled = false;
    const peerIDA = 'A';
    const peerIDB = 'B';
    const alice = new SMPPeer('1', 100, peerIDA);
    const bob = new SMPPeer('1', 100, peerIDB);

    alice.on('incoming', (_, __) => {
      isAliceCalled = true;
    });

    let resolve: any;
    const eventCalled = new Promise((res) => {
      resolve = res;
    });
    bob.on('incoming', (_, __) => {
      isBobCalled = true;
      resolve();
    });

    await alice.connectToPeerServer();
    await bob.connectToPeerServer();

    await alice.runSMP(peerIDB);
    await eventCalled;

    // Because it is Alice initiating SMP to Bob, there should only be Bob's callback getting called.
    expect(isAliceCalled).toBeFalsy();
    expect(isBobCalled).toBeTruthy();
  });

  test('fails when calling `runSMP` before running `connectToPeerServer`', async () => {
    const alice = new SMPPeer('1', 100, 'A');
    const bob = new SMPPeer('1', 100, 'B');
    await bob.connectToPeerServer();
    await expect(alice.runSMP(bob.id)).rejects.toThrowError(ServerUnconnected);
  });

  test('fails when the remote peer is not on the peer server', async () => {
    const alice = new SMPPeer('1', 100, 'A');
    await alice.connectToPeerServer();
    await expect(alice.runSMP('B')).rejects.toThrow();
  });

  test('fails when timeout', async () => {
    // Mock `Peer` with `MockPeerFakeSend`. `runSMP` will timeout because
    // data is not sent to remote at all.
    mockPeerClass = MockPeerFakeSend;
    // A timeout smaller than the default one in jest's test.
    const timeout = 1;
    const alice = new SMPPeer('1', 100, 'A', undefined, timeout);
    await alice.connectToPeerServer();
    const bob = new SMPPeer('1', 100, 'B', undefined, timeout);
    await bob.connectToPeerServer();
    await expect(alice.runSMP(bob.id)).rejects.toThrow(TimeoutError);
  });
});

// bob is listening incoming SMP
// SMP succeeds when xAmount is smaller than yAmount
async function smp(x: string, y: string, xAmount: number, yAmount: number) {
  const peerIDA = 'A';
  const peerIDB = 'B';
  const alice = new SMPPeer(x, xAmount, peerIDA);
  const bob = new SMPPeer(y, yAmount, peerIDB);
  await alice.connectToPeerServer();
  await bob.connectToPeerServer();
  return await alice.runSMP(peerIDB);
}
