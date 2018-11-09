const { WeatherManager } = require('./manager');

describe('Manager', function() {
    
    it('shoud calculate summary precipitation for each month', function() {
        const result = WeatherManager.processPrecipitation([ 
            { t: '1980-01-01', v: 1 },
            { t: '1980-01-02', v: 2 },
            { t: '1980-01-03', v: 3 },
            { t: '1980-02-01', v: 4 },
            { t: '1980-02-02', v: 5 },
            { t: '1980-03-01', v: 6 },
        ]);

        expect(result).toEqual([ 
            { v: 6, t: '1980-01-01' },
            { v: 9, t: '1980-02-01' },
            { v: 6, t: '1980-03-01' },
        ]);
    });

    it('shoud calculate average temperature for each month', function() {
        const result = WeatherManager.processTemperature([ 
            { t: '1980-01-01', v: 1 },
            { t: '1980-01-02', v: 2 },
            { t: '1980-01-03', v: 3 },
            { t: '1980-02-01', v: 4 },
            { t: '1980-02-02', v: 5 },
            { t: '1980-03-01', v: 6 },
        ]);

        expect(result).toEqual([ 
            { v: 2, t: '1980-01-01' },
            { v: 4.5, t: '1980-02-01' },
            { v: 6, t: '1980-03-01' },
        ]);
    });

    describe('manager.load', function() {
        it('should guaranty only one manager.load call', async function() {
            const apiResult = [];
            
            let apiCalls = 0;
            let createCalls = 0;

            const api = {
                get: async() => (++apiCalls, apiResult),
            }
            const storage = {
                create: () => ++createCalls,
            }

            const manager = new WeatherManager({ storage, api });

            const promise = manager.load('precipitation', WeatherManager.processPrecipitation);

            await promise;

            const promise2 = manager.load('precipitation', WeatherManager.processPrecipitation);
            const promise3 = manager.load('precipitation', WeatherManager.processPrecipitation);

            expect(apiCalls).toBe(1);
            expect(promise2).toBe(promise)
            expect(promise3).toBe(promise)
        });

        it('should guaranty only one manager.load call; persistent received array', async function() {
            let length = 3;

            const api = {
                get: async() => { return new Int32Array(length++) }
            }
            const storage = {
                create: () => {},
            }

            const manager = new WeatherManager({ storage, api });

            const processor = x => x;

            const l3 = await manager.load('zeros', processor);
            expect(l3).toBe(3)

            const l4 = await manager.load('zeros', processor);
            expect(l4).toBe(3)
        });
    });


});