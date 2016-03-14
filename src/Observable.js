// a simple mutable observable implementation
// just supports listeners, setting the value, and notifications
// about listeners being added/removed
export default class Observable {
  constructor(value){
    this._value = value;
    this._listeners = [];
    this._internalListeners = [];
  }
  set(value){
    this._value = value;
    this._emitChange();
  }

  get(){
    return this._value;
  }

  getInternalState(){
    var payload = {
      listenerCount: this._listeners.length,
    };
    return payload;
  }

  listen(fn){
    // wrap it in an object so we can === when removing
    // witout worrying about two listeners with the same function
    var listener = {fn};
    this._listeners.push(listener);
    const unsubscribe = () => {
      this._listeners = this._listeners.filter((x) => x !== listener);
      this._emitInternalChange();
    };
    this._emitInternalChange();
    return unsubscribe;
  }

  listenForInternalState(fn){
    var listener = {fn};
    this._internalListeners.push(listener);
    const unsubscribe = () => {
      this._internalListeners= this._internalListeners.filter((x) => x !== listener);
    };
    return unsubscribe;
  }

  _emitChange(){
    for (let listener of this._listeners) {
      listener.fn.call(this, this.get());
    }
  }

  _emitInternalChange(){
    var payload = this.getInternalState();
    for (let listener of this._internalListeners){
      listener.fn.call(this, payload);
    }
  }
}
