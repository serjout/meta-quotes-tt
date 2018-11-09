(() => {

function getMonth(yyyymmdd) {
    return yyyymmdd.substring(0, 7);
}

function sumMonth(rawData) {
    var month, 
        i,
        item,
        itemMonth,
        acc = 0,
        result = []; 

    if (rawData.length) {
        month = rawData[0].t.substring(0, 7);

        for (i = 0; i < rawData.length; i++) {
            item = rawData[i];
            itemMonth = item.t.substring(0, 7);
            if (itemMonth === month) {
                acc += item.v
            } else {
                result.push({ v: acc, t: month + '-01' });
                acc = item.v;
                month = itemMonth;
            }
        }

        result.push({ v: acc, t: month + '-01' });
    }

    return result;
}

function avgMonth(rawData) {
    var month, 
        i,
        item,
        itemMonth,
        acc = 0,
        cnt = 0,
        result = []; 

    if (rawData.length) {
        month = rawData[0].t.substring(0, 7);

        for (i = 0; i < rawData.length; i++) {
            item = rawData[i];
            itemMonth = item.t.substring(0, 7);
            if (itemMonth === month) {
                acc += item.v
                cnt++;
            } else {
                result.push({ v: acc / cnt, t: month + '-01' });
                acc = item.v;
                cnt = 1
                month = itemMonth;
            }
        }

        result.push({ v: acc / cnt, t: month + '-01' });
    }

    return result;
}

class WeatherManager {
    constructor({ storage, api }) {
        this.storage = storage
        this.api = api;
        this.loading = {};
    }

    load(entityName, processor) {
        if (this.loading[entityName] === undefined) {
            this.loading[entityName] = this.api
                .get(entityName)
                .then(raw => {
                    const data = processor(raw);

                    return this.storage.create(entityName, data);
                })
        }

        return this.loading[entityName];
    }

    async getPrecipitation(from, to) {
        if (!await this.storage.has('precipitation')) {
            await this.load('precipitation', WeatherManager.processPrecipitation);
        }

        const data = await this.storage.query('precipitation', from, to);
        return data;
    }
}

WeatherManager.processPrecipitation = sumMonth;
WeatherManager.processTemperature = avgMonth;

if (typeof module !== "undefined") {
    module.exports = { WeatherManager };
} else {
    self.WeatherManager = WeatherManager;
}

})();
