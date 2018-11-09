const e = document.querySelector('chart-element');

(async function() {
    const response = await fetch('/data/precipitation.json');
    const data = await response.json();

    const xxx = window.screen.width;

    const from = 0;
    const to = data.length;

    const resultLength = to - from;
    let maxValue = -Infinity;
    let minValue = +Infinity;
    const x = new Array(resultLength);
    const y = new Array(resultLength);

    let idx = 0;

    for (let i = from; i < to; i++) {
        const item = data[i];
        const v = item.v;
        if (v > maxValue) {
            maxValue = v;
        } else if (v < minValue) {
            minValue = v;
        }
        x[idx] = idx / resultLength;
        y[idx] = v;
        idx++;
    }

    const groupBy = Math.ceil(y.length / xxx) * 6;

    const z = group(y, groupBy);

    console.log('zzzz', groupBy, z.length)

    e.setRenderData(z);

    console.log(y);
})();

function group(arr, groupBy) {
    const reduced = [];
    let acc = 0;
    let c = 0;

    for (let i = 0; i < arr.length; i++) {
        acc += arr[i];
        c++;
        if (c === groupBy) {
            reduced.push(acc / c);
            c = 0;
            acc = 0;
        }
    }
    if (c !== 0) {
        reduced.push(acc / c);
    }

    return reduced;
}

