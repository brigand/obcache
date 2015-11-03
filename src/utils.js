export function getIn(obj, path){
  let current = obj;
  for (let key of path){
    if (current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

export function setIn(obj, path, value){
  let current = obj;
  for (let key of path.slice(0, -1)){
    if (current[key] === null || typeof current[key] !== 'object') {
      current[key] = {}; 
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
  return obj;
}

