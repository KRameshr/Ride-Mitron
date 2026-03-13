import https from 'https';

https.get('https://cdn.coverr.co/videos/coverr-driving-in-a-forest-2-4148/1080p.mp4', (res) => {
    console.log('Coverr Status:', res.statusCode);
});
