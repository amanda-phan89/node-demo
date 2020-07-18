const fs = require('fs');
const client = require('https');
const db = require('mysql');
const config = require('./config');
const { EventEmitter } = require("events");
const eventEmitter = new EventEmitter();

function createFolder(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function downloadFile(url, cb) {
    client.get(url, (response) => {
        const data = {
            success: true,
            url: url,
            content: ""
        };

        if (response.statusCode === 200) {
            response.on('data', (d) => {
                data.content += d;
            });
            response.on('end', () => {
                cb(data)
            });
        } else {
            data.success = false;
            cb(data);
        }
    })
}

function downloadFiles(urls, cb) {
    const dataFile = [];
    for (let url of urls) {
        downloadFile(url, (data) => {
            dataFile.push(data);

            if (dataFile.length == urls.length) {
                eventEmitter.emit('download_done');
            }
        })
    }

    eventEmitter.on('download_done', () => {
        cb(dataFile);
    })
}

function writeFile(fileName, content, cb) {
    fs.writeFile(fileName, content, (err) => {
        if (err) {
            throw err;
        }
        cb(fileName);
    })
}

function writeFiles(dir, dataFile, cb) {
    const dataInsert = [];
    let countDataInsert = 0;
    for (let element of dataFile) {
        if (!element.success) {
            console.log('Download failed:' + element.url);
            continue;
        }
        countDataInsert++;
        let fileName = dir + element.url.substr(element.url.lastIndexOf('/') + 1);
        writeFile(fileName, element.content, (fileName) => {
            dataInsert.push(fileName);

            if (dataInsert.length == countDataInsert) {
                eventEmitter.emit('write_done');
            }
        });
    }

    eventEmitter.on('write_done', () => {
        cb(dataInsert);
    })
}

function insertDb(data) {
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
            throw err;
        }
        conn.end();
        console.log('insert successfully');
    });
}

function main() {
    const urls = [
        'https://thumbs.dreamstime.com/z/aerial-view-lago-antorno-dolomites-lake-mountain-landscape-alps-peak-misurina-cortina-di-ampezzo-italy-reflected-103752677.jpg',
        'https://thumbs.dreamstime.com/z/ir-landscape-forest-pond-infrared-photography-34764168.jpg',
        'https://thumbs.dreamstime.com/z/image-wood-texture-boardwalk-beautiful-autumn-landscape-background-free-copy-space-use-background-backdrop-to-132997627.jpg'
    ];

    const dir = './images/';

    try {
        createFolder(dir);
        downloadFiles(urls, (dataFile) => {
            writeFiles(dir, dataFile, (dataInsert) => {
                insertDb(dataInsert);
            })
        })
    } catch (err) {
        console.log(err);
    }
}

main();
