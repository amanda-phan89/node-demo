const utils = require('./utilPromise');

async function main() {
    const urls = [
        'https://abc.com/tmp_link',
        'https://thumbs.dreamstime.com/z/aerial-view-lago-antorno-dolomites-lake-mountain-landscape-alps-peak-misurina-cortina-di-ampezzo-italy-reflected-103752677.jpg',
        'https://thumbs.dreamstime.com/z/ir-landscape-forest-pond-infrared-photography-34764168.jpg',
        'https://thumbs.dreamstime.com/z/image-wood-texture-boardwalk-beautiful-autumn-landscape-background-free-copy-space-use-background-backdrop-to-132997627.jpg'
    ];

    const dir = './images/';

    await utils.createFolder(dir)
    console.log('Start download');
    const dataImages = await Promise.all(
        urls.map(async url => {
            return await utils.downloadFile(url)
        })
    );
    console.log("Done download file. Starting write file");

    const fileData = [];
    for (let element of dataImages) {
        if (!element.success) {
            console.log('Download failed:' + element.url);
            continue;
        }
        fileData.push({
            "name": dir + element.url.substr(element.url.lastIndexOf('/') + 1),
            "content": element.content
        })
    }
    const fileNames = await Promise.all(
        fileData.map(async data => {
            return await utils.writeFile(data.name, data.content);
        })
    )

    utils.insertDb(fileNames);
}

main();
