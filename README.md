obcache is a utility for client side data caching, and ensuring all users of the data see updates. For use with react, see [react-obcache].

It uses listener reference counting to avoid no longer needed data piling up.

[react-obcache]: https://github.com/brigand/react-obcache

## Install

```
npm install obcache --save
```

## Usage

Start by creating a cache. You can then `.register` handlers which are
responsible for providing promises of data.

```js
import ObCache from 'obcache';

var cache = new ObCache();
export default cache;

cache.register('userProfile', ([userId]) => {
  var promise = api.get('/user/' + userId + '/profile');
  return promise;
});
```

This example shows the full api of obcache. Typically you won't deal with it directly, but
use a wrapper for your ui library/framework.

```js
import cache from './cache';

var profile = cache
  .get('userProfile', '4920840918098')

profile.key === 'userProfile├4920840918098';

// makes the api request if the data isn't already present
// and registers listeners for new values
// they're called immediately if there is already a value or error
var unsubscribe = profile.listen({
  okay(profile) {
    console.log(profile);
  },
  error(error) => {
    console.log(error);
  },
  all(errorOrProfile) => {
  },
});

setTimeout(() => {
  // force a new request for the data, listeners are called again when it completes
  profile.refresh();
}, 1000)

setTimeout(() => {
  // remove our listener
  // the data becomes eligable for collection if there are no other listeners
  unsubscribe();
}, 5000);

// manually set the value
// this is typically used when e.g. you have a user listing call that wants
// to create several userProfile observables in the cache
profile.set({firstName: 'x', lastName: 'y'});

// set it to the new value; revert if the promise is rejected
// this can be used for optimistic updates
profile.setAssuming({firstName: 'x', lastName: 'y'}, () => {
  return aPromise;
});

// similar to the above but only updates the keys in the object mentioned
// so with state {a: 1, b: 2}; .update({a: 3}) results in {a: 3, b: 2}
// with set, it'd be replaced with {a: 3}
// updates are immutable transactions
profile.update(...)
profile.updateAssuming(...)
```


## ES6 deps

obcache works best if setImmediate is available. Core.js (or babel polyfill) provides it.

Object.assign is required.

## Development

Run `npm run dev` in one terminal, and `npm run dev-test` in another.

To do a single build, `npm run build` and `npm run test`.


