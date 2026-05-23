const { Jimp } = require('jimp');

async function main() {
    try {
        const image = await Jimp.read('./public/images/logo.jpg');
        image.circle();
        await image.write('./public/images/logo-circle.png');
        console.log("Created circle logo!");
    } catch (e) {
        console.error(e);
    }
}
main();
