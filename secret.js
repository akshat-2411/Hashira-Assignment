const fs = require("fs");

function modPow(base, exp, mod) {
    base = base % mod;
    let result = 1n;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % mod;
        base = (base * base) % mod;
        exp = exp / 2n;
    }
    return result;
}

function modInv(a, mod) {
    return modPow(a, mod - 2n, mod);
}

function lagrangeInterpolation(points, mod) {
    let result = 0n;
    const k = points.length;

    for (let i = 0; i < k; i++) {
        let xi = BigInt(points[i][0]);
        let yi = BigInt(points[i][1]);
        let num = 1n;
        let den = 1n;
        for (let j = 0; j < k; j++) {
            if (i === j) continue;
            let xj = BigInt(points[j][0]);
            num = (num * -xj + mod) % mod;
            den = (den * (xi - xj + mod)) % mod;
        }
        const term = yi * num * modInv(den, mod) % mod;
        result = (result + term) % mod;
    }

    return result;
}

function combinations(arr, k) {
    const result = [];
    const backtrack = (start, path) => {
        if (path.length === k) {
            result.push([...path]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            path.push(arr[i]);
            backtrack(i + 1, path);
            path.pop();
        }
    };
    backtrack(0, []);
    return result;
}

function parseInput(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const k = data.keys.k;
    const points = [];

    for (const key in data) {
        if (key === "keys") continue;
        const x = BigInt(key);
        const base = parseInt(data[key].base);
        const y = BigInt(parseInt(data[key].value, base));
        points.push({ x, y });
    }

    return { k, points };
}

function recoverSecretFromCode2File(filePath) {
    const MOD = 10n ** 18n + 3n;
    const { k, points } = parseInput(filePath);

    const combos = combinations(points, k);
    const secretCounts = new Map();

    for (const combo of combos) {
        const pts = combo.map(({ x, y }) => [x, y]);
        try {
            const secret = lagrangeInterpolation(pts, MOD);
            const key = secret.toString();
            secretCounts.set(key, (secretCounts.get(key) || 0) + 1);
        } catch (err) {

        }
    }

    let maxCount = 0;
    let mostLikelySecret = null;
    for (const [secret, count] of secretCounts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            mostLikelySecret = secret;
        }
    }

    console.log(`Recovered Secret from ${filePath}:`, mostLikelySecret);
}

function main() {
    const inputFiles = ["input1.json", "input2.json"];
    inputFiles.forEach(recoverSecretFromCode2File);
}

main();