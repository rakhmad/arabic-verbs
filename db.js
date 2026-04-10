// db.js — IndexedDB wrapper for SRS progress
// Sets window.DB

(function () {

  var DB_NAME = "arabic-verbs";
  var DB_VERSION = 1;
  var STORE = "progress";
  var _db = null;

  function open() {
    return new Promise(function (resolve, reject) {
      if (_db) { resolve(_db); return; }
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = function (e) {
        _db = e.target.result;
        resolve(_db);
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  }

  function getProgress(cardId) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(cardId);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function saveProgress(progressObj) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        var req = tx.objectStore(STORE).put(progressObj);
        tx.oncomplete = function () { resolve(); };
        req.onerror = function () { reject(req.error); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getAllProgress() {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).getAll();
        req.onsuccess = function () {
          var map = {};
          (req.result || []).forEach(function (p) { map[p.id] = p; });
          resolve(map);
        };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function clearAll() {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).clear();
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  window.DB = { open: open, getProgress: getProgress, saveProgress: saveProgress, getAllProgress: getAllProgress, clearAll: clearAll };

})();
