const { Jimp } = require('jimp');

async function main() {
    try {
        console.log("Reading original image...");
        const image = await Jimp.read('./public/images/banner1.png');
        const w = image.bitmap.width * 2;
        const h = image.bitmap.height * 2;
        console.log(`Resizing to ${w}x${h}...`);
        
        // Double the resolution
        image.resize({ w, h });
        
        await image.write('./public/images/banner1_hd.png');
        console.log("Enhanced image created successfully as banner1_hd.png!");
    } catch (e) {
        console.error("Error enhancing image:", e);
    }
}
main();
