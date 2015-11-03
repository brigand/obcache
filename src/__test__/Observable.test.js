import 'babel-polyfill';
import {expect} from 'chai';
import sinon from 'sinon';
import Observable from '../Observable.js';

describe('Observable', () => {
  var ob, cb;

  beforeEach(() => {
    cb = sinon.spy();
    ob = new Observable(1);
  });

  it('has a value', () => {
    expect(ob.get()).to.equal(1);
  });

  it('emits change', () => {
    ob.listen(cb);
    ob.set(2);
    expect(cb.calledOnce).to.equal(true);
    expect(cb.getCall(0).args[0]).to.equal(2);
  });

  it('emits internal change', () => {
    ob.listenForInternalState(cb);
    expect(cb.called).to.equal(false);
    ob.listen(() => {});
    expect(cb.calledOnce).to.equal(true);
    expect(cb.getCall(0).args[0]).to.deep.equal({listenerCount: 1});
  });
});

