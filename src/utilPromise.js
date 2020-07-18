const fs = require('fs');
const client = require('https');
const db = require('mysql');
const config = require('./config');

function createFolder(dir) {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            resolve();
        } catch (err) {
            reject('Create folder failed: ' + err);
        }
    })
}

function downloadFile(url) {
    return new Promise((resolve, reject) => {
        const data = {
            success: true,
            url: url,
            content: ""
        };

        client.get(url, (response) => {
            if (response.statusCode === 200) {
                response.on('data', (d) => {
                    data.content += d;
                });
                response.on('end', () => {
                    resolve(data)
                });
            } else {
                // throw new Error("Download url failed: "+url); // Output: Xuat hien exception tren console
                // reject("Download url failed: "+url); // Output: vao khoi catch cua Promise chain ngay lap tuc
                data.success = false;
                resolve(data);
            }
        })
            .on("error", () => {
                reject("GET request error: " + url);
            });
    })
}

function writeFile(fileName, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, content, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(fileName);
        })
    })
}

function insertDb(data) {
    return new Promise((resolve, reject) => {
        const conn = db.createConnection({
            host: config.db.host,
            user: config.db.username,
            password: config.db.password,
            database: config.db.database
        });

        const sql = "INSERT INTO images (name) VALUES ?";
        const values = [];
        for (element of data) {
            values.push([element]);
        }
        conn.query(sql, [values], function (err) {
            if (err) {
                reject(err);
            } else {
                console.log('insert successfully');
                resolve();
            }
            conn.end();
        });
    })
}

module.exports = {
    createFolder,
    downloadFile,
    writeFile,
    insertDb
}
