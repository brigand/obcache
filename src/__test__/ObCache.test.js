import 'babel-polyfill';
import {expect} from 'chai';
import sinon from 'sinon';
import ObCache from '../ObCache.js';

const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

describe('ObCache', () => {
  var cache, cb;
  beforeEach(() => {
    cache = new ObCache();
    cache.register('test', async ([data]) => {
      return data;
    });
    cb = sinon.stub();
  });

  it('calls the register promiseFactory at the correct time', () => {
    cache.register('x', async ([x]) => cb(x));
    expect(cb.called).to.equal(false);
    var item = cache.get('x', 'y', 'z');
    item.listen({});
    expect(cb.called).to.equal(false);
    return wait(10).then(() => {
      expect(cb.called).to.equal(true);
      expect(cb.getCall(0).args[0]).to.equal('y');
    });
  });

  it('it creates one copy of observables', () => {
    expect(cache.get('test')).to.equal(cache.get('test'));
  });

  it('set works', () => {
    cache.register('x', ([x]) => {
      cb(x);
    });
    cache.set('test', 'a'); 
    var obs = cache.get('test');
    expect(obs.get()).to.equal('a');
    expect(cb.called).to.equal(false);
    obs.listen({});
    expect(cb.called).to.equal(false);
    return wait(1).then(() => {
      expect(cb.called).to.equal(false);
    })
  });
});

