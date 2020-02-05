export function loadCuratedData(gene1, gene2){
    return loadData(gene1, gene2, "/get_words_counter_from_wb_db");
}

export function loadTextpressoData(gene1, gene2) {
    return loadData(gene1, gene2, "/get_words_counter_from_tpc")
}

function loadData(gene1, gene2, endpoint) {
    return new Promise((resolve, reject ) => {
        let payload = {
            gene1: gene1,
            gene2: gene2
        };
        fetch(process.env.REACT_APP_API_ENDPOINT + endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                reject("Error")
            }
        }).then(data => {
            if (data === undefined) {
                reject("Empty response")
            }
            let arr = [];
            Object.keys(data["counters"]).forEach((k) => {
                arr.push({"text": k, "value": parseInt(data["counters"][k])});
            });
            resolve(arr)
        }).catch((err) => {
            reject(err);
        });
    });
}