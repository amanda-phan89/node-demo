const utils = require('./utilPromise');

function main() {
    const urls = [
        'https://abc.com/tmp_link',
        'https://thumbs.dreamstime.com/z/aerial-view-lago-antorno-dolomites-lake-mountain-landscape-alps-peak-misurina-cortina-di-ampezzo-italy-reflected-103752677.jpg',
        'https://thumbs.dreamstime.com/z/ir-landscape-forest-pond-infrared-photography-34764168.jpg',
        'https://thumbs.dreamstime.com/z/image-wood-texture-boardwalk-beautiful-autumn-landscape-background-free-copy-space-use-background-backdrop-to-132997627.jpg'
    ];

    const dir = './images/';

    console.log('Start download');
    utils.createFolder(dir)
        .then(() => {
            const tasks = [];
            for (let url of urls) {
                let task = utils.downloadFile(url);
                tasks.push(task);
            }

            return Promise.all(tasks);
        })
        .then((data) => {
            console.log("Done download file. Starting write file");
            const tasks = [];
            for (let element of data) {
                if (!element.success) {
                    console.log('Download failed:' + element.url);
                    continue;
                }
                let fileName = dir + element.url.substr(element.url.lastIndexOf('/') + 1);
                let task = utils.writeFile(fileName, element.content);
                tasks.push(task);
            }

            return Promise.all(tasks);
        })
        .then((data) => {
            console.log("Done write file. Starting insert into db");
            utils.insertDb(data);
        })
        .catch((err) => {
            console.log(err);
        })
}

main();