const https = require('https');

const urls = [
    'https://assets.mixkit.co/videos/preview/mixkit-cars-on-the-highway-in-a-sunny-day-30477-large.mp4',
    'https://cdn.pixabay.com/video/2019/08/17/26107-355919323_large.mp4',
    'https://videos.pexels.com/video-files/3163534/3163534-uhd_2560_1440_24fps.mp4',
    'https://res.cloudinary.com/demo/video/upload/v1689252399/docs/car-driving_ysp1t4.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

async function check(url) {
    return new Promise(resolve => {
        https.get(url, (res) => {
            resolve({ url, status: res.statusCode });
        }).on('error', (e) => resolve({ url, status: e.message }));
    });
}

async function run() {
    for (const u of urls) {
        const res = await check(u);
        console.log(`${res.status} : ${res.url}`);
    }
}

run();
