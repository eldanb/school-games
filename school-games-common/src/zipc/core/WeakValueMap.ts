export class WeakValueMap<K, V extends object> {
  private _map: Map<K, WeakRef<V>> = new Map();
  private _finalizationRegistry = new FinalizationRegistry((key: K) => {
    this._map.delete(key);
  });

  put(key: K, v: V) {
    this._finalizationRegistry.register(v, key);
    this._map.set(key, new WeakRef(v));    
  }

  get(key: K): V | null {
    return this._map.get(key)?.deref();
  }

  remove(key: K) {
    this._map.delete(key);
  }
}