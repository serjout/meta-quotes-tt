(() => {
    
const theWeatherApi = {
    async get(entityName) {
        const response = await fetch(`/data/${entityName}.json`);
        const data = await response.json();

        return data;
    }
}

self.theWeatherApi = theWeatherApi;

})();