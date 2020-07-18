var fs = require('fs');
var http = require('http');

var urls = [
    'http://www.planwallpaper.com/static/images/blue_fire_deviantart_zippo_depth_of_field_lighters_desktop_1280x1024_hd-wa_tbMipBi.jpg',
    'http://www.planwallpaper.com/static/images/11-sea-beach-sand-wallpaper_w80EYH0.jpg',
    'http://www.planwallpaper.com/static/images/new-wallpaper-3_lA2aDVm.jpg'
];

var dir = './images/';

console.log('Download started');
createFolder(dir)
    .then(() => {
        var tasks = [];

        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            var task = downloadFile(dir, url);
            tasks.push(task);
        }

        return Promise.all(tasks);
    })
    .then((data) => {
        for (index in data) {
            var item = data[index];
            if (item.success === true) {
                console.log('Download success: ' + item.url);
            } else {
                console.log('Download failed: ' + item.url);
            }
        }
        console.log('Download finish');
    })
    .catch((err) => {
        console.log(err);
    })

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

function downloadFile(dir, url) {
    return new Promise((resolve, reject) => {
        var file_name = dir + url.substr(url.lastIndexOf('/') + 1);
        var file = fs.createWriteStream(file_name);
        var data = {
            success: true,
            url: url
        };

        http.get(url, function (response) {
            if (response.statusCode === 200) {
                response.pipe(file);
                closeFile(file, function () {
                    resolve(data);
                })
            } else {
                data.success = false;
                resolve(data);
            }
        })
        .on("error", () => {
            reject("GET request error: " + url);
        });
    })
}

function closeFile(file, callback) {
    file.on('finish', function () {
        file.close(function () {
            callback.apply(null, arguments);
        })
    })
}