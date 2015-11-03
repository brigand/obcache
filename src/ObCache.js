import MyObservable from './Observable';
import {getIn, setIn} from './utils';

var immediate;
try {
  setImmediate && (immediate = setImmediate);
}
catch (e) {
  immediate = (f) => setTimeout(f);
}

export default class ObCache {
  constructor(opts){
    this.handlers = {};
    this.observables = {};
  }

  register(handlerType, handlerPromiseFactory){
    this.handlers[handlerType] = {
      promiseFactory: handlerPromiseFactory,
      handlerType: handlerType,
    };
  }

  get(...keys){
    var handlerType = keys[0];
    this._ensureRegister(handlerType);

    let observable = getIn(this.observables, keys);
    if (observable) return observable;

    // create a new observable
    var {promiseFactory} = this.handlers[handlerType];

    observable = new MyObservable({status: 'INITIAL'});

    // refreshes the observable value by refetching the data
    // ensures two refreshes aren't happening at once
    observable.refresh = () => {
      if (observable._pendingRefresh) return;
      observable._pendingRefresh = true;
      observable._hasStartedOneRefresh = true;

      immediate(() => {
        promiseFactory(keys.slice(1))
          .then((res) => {
            observable._pendingRefresh = false;
            observable.set({status: 'OKAY', data: res});
          }, (err) => {
            observable._pendingRefresh = false;
            observable.set({status: 'ERROR', data: err});
          });
      });
    };
    setIn(this.observables, keys, observable);

    var {listen} = observable;
    observable.listen = ({okay, error, any}) => {
      const handler = ({status, data}) => {
        if (status === 'OKAY') {
          okay && okay(data);
          any && any(data);
        }
        else if (status === 'ERROR'){
          error && error(data);
          any && any(data);
        }
        else {
          any && any(data)
        }
      };


      // call it right now
      handler(observable.get());

      if (!observable._hasStartedOneRefresh) {
        observable.refresh();
      } 

      // returns the unsubscribe function
      return listen.call(observable, handler);
    };

    // keep track of the number of listeners
    // if the number reaches 0, remove it from the cache
    var hasTimeout = false;
    var internalUnsubscribe = observable.listenForInternalState(() => {
      if (hasTimeout) return;

      hasTimeout = true;
      immediate(() => {
        hasTimeout = false;
        var {listenerCount} = observable.getInternalState();
        if (listenerCount === 0) {
          internalUnsubscribe();

          // allow it to be GC'd
          setIn(this.observables, keys, undefined);
        }
      });
    });
    return observable;
  }

  _ensureRegister(handlerType){
    if (!this.handlers[handlerType]){
      throw new TypeError(`Unknown handler type "${handlerType}" for this obcache`);
    }
  }
}

