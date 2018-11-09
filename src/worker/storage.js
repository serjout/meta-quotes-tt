(() => {

const empty = {};

class MyStorage {
    constructor({ dbName } = empty) {
        this.dbName = dbName;
        this.db = undefined;

        window.xxx = this;
    }

    _open() {
        if (this.dbOpening === undefined) {
            this.dbOpening = new Promise((resolve, reject) => {
                const request = indexedDB.open(this.dbName);

                request.onerror = event => reject(event.target)
                request.onsuccess = event => resolve(this.db = event.target.result);
            });
        }

        return this.dbOpening;
    }

    async _migrate(migration) {
        const version = await this.getDbVersion();

        await this._close();

        const promise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, version + 1);

            request.onerror = event => reject(event.target)
            request.onsuccess = event => resolve(this.db = event.target.result);
            request.onupgradeneeded = event => {
                const db = event.target.result;
                migration(db);
                db.close();
                this.dbOpening = undefined;
                resolve(db);
            }
        });

        const db = await promise;
        
        return db;
    }

    async _close() {
        if (this.dbOpening !== undefined) {
            const db = await this._open();

            this.dbOpening = undefined;
            db.close();
        }
    }

    async getDbVersion() {
        await this._open();

        return this.db.version;
    }

    async _getObjectStore(entityName, mode = 'readonly') {      
        if (await this.has(entityName)) {
            const db = await this._open();

            return db.transaction([entityName], mode).objectStore(entityName);
        } else {
            return null;
        }
    }

    create(entityName, data, { keyPath = 't' } = empty) {
        return new Promise(async (resolve, reject) => {
            if (!await this.has(entityName)) {
                await this._migrate(
                    next => next.createObjectStore(entityName, { keyPath })
                );
            }
            const store = await this._getObjectStore(entityName, 'readwrite');

            let counter = 0;

            function done() {
                counter--;

                if (counter === 0) {
                    //this._close();  

                    resolve(data.length);
                }
            }

            for (let item of data) {
                const req = store.add(item);
                counter++;
                req.onsuccess = done;
                req.onerror = event => reject(event.target.error);
            }
        });
    }

    query(entityName, from, to) {
        return new Promise(async (resolve, reject) => {
            const keyRange = IDBKeyRange.bound(from, to, true, true);
            const store = await this._getObjectStore(entityName);
            const cursor = store.openCursor(keyRange);
            const result = [];

            cursor.onsuccess = event => {
                const cursor = event.target.result;

                if (cursor) {
                    result.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(result);
                }
            }

            cursor.onerror = reject;
        });
    }

    async has(entityName) {
        await this._open();

        return Array.from(this.db.objectStoreNames).indexOf(entityName) !== -1;
    }
}

if (typeof module !== "undefined") {
    module.exports = { MyStorage };
} else {
    self.MyStorage = MyStorage;
}

})();

