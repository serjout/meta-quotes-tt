importScripts(
    '/srs/worker/the-api',
    '/srs/worker/storage',
    '/srs/worker/manager',
);

const storage = new MyStorage({ dbName: 'weather' });
const api = theWeatherApi;
const manager = new WeatherManager({ storage, api });


const a = manager.getPrecipitation('1990-01', '1995-01');
