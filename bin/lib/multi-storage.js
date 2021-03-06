var Utils = require('./utils');
(function () {
    'use strict';
    var root = typeof self == 'object' && self.self === self && self ||
        typeof global == 'object' && global.global === global && global ||
        this;
    var MAX_SAFE_NUMBER = Math.pow(2, 53) - 1;
    var MultiStorageStatus;
    (function (MultiStorageStatus) {
    })(MultiStorageStatus || (MultiStorageStatus = {}));
    var MultiStorage = (function () {
        function MultiStorage(settings) {
            var _this = this;
            this._data = [];
            this._config = {
                flagName: 'flagId',
                userData: {
                    type: 'div',
                    className: 'client-flag'
                },
                indexedDb: {
                    dbName: 'MultiStorage',
                    tableName: 'flagTable'
                }
            };
            this._defaultSettings = {
                cookie: true,
                localStorage: true,
                userData: true,
                indexedDB: true
            };
            this._setting = this._defaultSettings;
            settings ?
                Utils.each(Utils.keys(this._defaultSettings), function (key) {
                    settings[key] === undefined || typeof settings[key] === 'undefined' ? null : _this._setting[key] = settings[key];
                }) : null;
        }
        MultiStorage.prototype.setItem = function (name, value) {
            return this._broadcast('setItem', { name: name, value: value });
        };
        MultiStorage.prototype.set = function (data) {
            return this._broadcast('set', data);
        };
        MultiStorage.prototype.getItem = function (name) {
            return this._broadcastGet('getItem', name);
        };
        MultiStorage.prototype.get = function () {
            return Utils.intersection(this._broadcastGet('get'));
        };
        MultiStorage.prototype.removeItem = function (name) {
            return this._broadcast('removeItem', name);
        };
        MultiStorage.prototype.clear = function () {
            return this._broadcast('clear');
        };
        MultiStorage.prototype.getClassByName = function (name) {
            var _class;
            if (this._setting[name]) {
                switch (name) {
                    case 'cookie':
                        _class = new Cookie();
                        break;
                    case 'localStorage':
                        _class = new LocalStorage();
                        break;
                    case 'userData':
                        _class = new UserData();
                        break;
                    case 'indexedDB':
                        _class = new IndexedDB();
                        break;
                    default:
                        _class = new Cookie();
                }
            }
            return _class;
        };
        MultiStorage.prototype._broadcast = function (func, data) {
            var resultStatus = false;
            for (var key in this._setting) {
                var _class = this.getClassByName(key);
                (data ? _class[func].call(this, data) : _class[func].call(this)) ? resultStatus = true : null;
            }
            return resultStatus;
        };
        MultiStorage.prototype._broadcastGet = function (func, data) {
            var resultData;
            for (var key in this._setting) {
                var _class = this.getClassByName(key);
                data ? _class[func].call(this, data) : _class[func].call(this);
            }
        };
        return MultiStorage;
    })();
    var Cookie = (function () {
        function Cookie(name, value, expires) {
            this._data = [];
            name && value && this.setItem(name, value);
        }
        Cookie.prototype.setItem = function (name, value, expires) {
            var localValue = value || '', localName = '';
            if (typeof name === 'object' && !value) {
                localName = name['name'];
                localValue = name['value'];
            }
            if (!localName && !localValue) {
                return false;
            }
            root.document.cookie = localName + '=' + localValue + (expires ? 'expires=' + expires : '');
            this._data.push(localName);
            return true;
        };
        Cookie.prototype.set = function (data) {
            var _this = this;
            var setStatus = true, keys = Object.keys(data), dataLength = keys.length;
            keys.forEach(function (key) {
                !_this.setItem(key, data[key]) ? setStatus = false : null;
            });
            return setStatus;
        };
        Cookie.prototype.get = function (name) {
            var cookie = root.document.cookie, value = '', nameIndex, valueIndex;
            if (cookie.length > 0 && this._data.indexOf(name) >= 0) {
                nameIndex = cookie.indexOf(name + '=');
                if (nameIndex > -1) {
                    valueIndex = cookie.indexOf(';', nameIndex);
                    value = valueIndex > -1 ? cookie.substring(nameIndex + name.length + 1, valueIndex) : '';
                }
            }
            return value;
        };
        Cookie.prototype.getAll = function () {
            var _this = this;
            var result = {};
            this._data.forEach(function (dataItem) {
                result[dataItem] = _this.get(dataItem);
            });
            return result;
        };
        Cookie.prototype.removeItem = function (name) {
            if (name && this._data.indexOf(name) >= 0) {
                var localCookie = name + '=' + this.get(name) + '; expires=' + new Date(0);
                root.document.cookie = localCookie;
                return true;
            }
            return false;
        };
        Cookie.prototype.clear = function () {
            var _this = this;
            var clearStatus = true;
            this._data.forEach(function (dataItem) {
                !_this.removeItem(dataItem) ? clearStatus = false : null;
            });
            return clearStatus;
        };
        return Cookie;
    })();
    var LocalStorage = (function () {
        function LocalStorage(name, value) {
            this._data = [];
            name && value && this.setItem(name, value);
        }
        LocalStorage.prototype.setItem = function (name, value, expires) {
            if (!name || !value) {
                return false;
            }
            else {
                root.localStorage.setItem(name, value);
                this._data.push(name);
                return true;
            }
        };
        LocalStorage.prototype.set = function (data) {
            var _this = this;
            var setStatus = true, keys = Object.keys(data), dataLength = keys.length;
            keys.forEach(function (key) {
                !_this.setItem(key, data[key]) ? setStatus = false : null;
            });
            return setStatus;
        };
        LocalStorage.prototype.get = function (name) {
            return name ? root.localStorage.getItem(name) : '';
        };
        LocalStorage.prototype.getAll = function () {
            var _this = this;
            var result = {};
            this._data.forEach(function (dataItem) {
                result[dataItem] = _this.get(dataItem);
            });
            return result;
        };
        LocalStorage.prototype.removeItem = function (name) {
            if (name && this._data.indexOf(name) >= 0) {
                root.localStorage.removeItem(name);
                return true;
            }
            return false;
        };
        LocalStorage.prototype.clear = function () {
            var _this = this;
            var clearStatus = true;
            this._data.forEach(function (dataItem) {
                !_this.removeItem(dataItem) ? clearStatus = false : null;
            });
            return clearStatus;
        };
        return LocalStorage;
    })();
    var UserData = (function () {
        function UserData(setting) {
            setting ? this._setting = setting : null;
        }
        UserData.prototype.set = function (name, value) {
            console.log('in UserData set:', name, value);
            if (name && value) {
                try {
                    var element = root.document.createElement(this._setting.elementName);
                    element.style.visibility = "hidden";
                    element.setAttribute("class", name);
                    document.body.appendChild(element);
                    element.style.behavior = "url(#default#userData)";
                    element.setAttribute(name, value);
                    element.save(name);
                    return true;
                }
                catch (error) {
                    console.log('setUserData error', error);
                    return false;
                }
            }
            return false;
        };
        UserData.prototype.get = function (name) {
            console.log('in UserData get:', name);
            try {
                var element = root.document.getElementsByClassName(this._setting.className);
                element.load(name);
                return element.getAttribute(name) || '';
            }
            catch (error) {
                console.log('error in getFlashCookie', error);
                return '';
            }
        };
        UserData.prototype.clear = function () {
            console.log('in userData clear:');
            root.localStorage.clear();
        };
        UserData.prototype.removeItem = function (name) {
            console.log('in UserData removeItem:');
        };
        return UserData;
    })();
    var IndexedDB = (function () {
        function IndexedDB(settings) {
            this._config = {
                dbName: 'MultiStorageDB',
                tableName: 'MultiStorage'
            };
            this._defaultSettings = {
                dbName: 'MultiStorageDB',
                tableName: 'MultiStorage'
            };
            this._settings = this._defaultSettings;
            if (settings) {
                for (var key in this._defaultSettings) {
                    settings[key] === undefined || typeof settings[key] === 'undefined' ? null : this._settings[key] = settings[key];
                }
            }
        }
        IndexedDB.prototype.openDB = function (name, callback) {
            var request = root.indexedDB.open(name);
            request.onerror = function (event) {
                console.log('open error');
            };
            request.onsuccess = function (event) {
                console.log('open success');
                return callback.call(this, event.target.result);
            };
        };
        IndexedDB.prototype.set = function () {
            console.log('in IndexedDB set:');
            var localIndexedDB = root.indexedDB = root.indexedDB || root.mozIndexedDB || root.webkitIndexedDB || window.msIndexedDB;
            var result = this.openDB('test', function (result) {
                console.log('result:', result);
            });
            var customerData = [
                { ssn: "aa", name: "Bill", age: 35, email: "bill@company.com" },
                { ssn: "bb", name: "Donna", age: 32, email: "donna@home.org" }
            ];
            console.log('indexedDb set result:', result);
            var request = self.indexedDB.open('test1');
            request.onsuccess = function (event) {
                var db = event.target.result;
                console.log('in onsuccess:', db);
                var transaction = db.transaction(["students"], "readwrite");
                ;
                var customerData = [
                    { ssn: "aa", name: "Bill", age: 35, email: "bill@company.com" },
                    { ssn: "bb", name: "Donna", age: 32, email: "donna@home.org" }
                ];
                var store = transaction.objectStore('students');
                console.log('in transaction omcomplete:', customerData);
                for (var index = 0, length = customerData.length; index < length; index++) {
                    console.log('customerData:', customerData, index);
                    store.add(customerData[index]);
                }
                console.log('onsuccess in IndexedDB get:', db, transaction);
            };
        };
        IndexedDB.prototype.get = function (name) {
            console.log('in IndexedDB get:', name);
            var request = self.indexedDB.open('test1');
            request.onsuccess = function (event) {
                var db = event.target.result;
                console.log('in onsuccess:', db);
                var transaction = db.transaction(["students"], "readwrite");
                ;
                var customerData = [
                    { ssn: "aa", name: "Bill", age: 35, email: "bill@company.com" },
                    { ssn: "bb", name: "Donna", age: 32, email: "donna@home.org" }
                ];
                var store = transaction.objectStore('students');
                var dataRequest = store.get('value');
                dataRequest.onsuccess = function (event) {
                    console.log('request result:', request.result);
                };
                console.log('onsuccess in IndexedDB get:', db, transaction);
            };
        };
        IndexedDB.prototype.clear = function () {
            console.log('in IndexedDB clear:');
            root.localStorage.clear();
        };
        IndexedDB.prototype.removeItem = function (name) {
            console.log('in IndexedDB removeItem:');
        };
        return IndexedDB;
    })();
    ;
    root.MultiStorage = MultiStorage;
}());
//# sourceMappingURL=multi-storage.js.map