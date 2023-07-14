//import ThumbnailGenerator from 'video-thumbnail-generator';
const ThumbnailGenerator = require('video-thumbnail-generator').default;
class VideoThumbnail {
    constructor() {
        this.tg = new ThumbnailGenerator({
            sourcePath: '/tmp/test.mp4',
            thumbnailPath: '/tmp/',
            tmpDir: '/some/writeable/directory' //only required if you can't write to /tmp/ and you need to generate gifs
        });
    }
    async generateThumb() {
        this.tg.generate()
            .then(console.log);
        // [ 'test-thumbnail-320x240-0001.png',
        //  'test-thumbnail-320x240-0002.png',
        //  'test-thumbnail-320x240-0003.png',
        //  'test-thumbnail-320x240-0004.png',
        //  'test-thumbnail-320x240-0005.png',
        //  'test-thumbnail-320x240-0006.png',
        //  'test-thumbnail-320x240-0007.png',
        //  'test-thumbnail-320x240-0008.png',
        //  'test-thumbnail-320x240-0009.png',
        //  'test-thumbnail-320x240-0010.png' ]
    }

    async generateThumbOneByPercent() {
        this.tg.generateOneByPercent(90)
            .then(console.log);
// 'test-thumbnail-320x240-0001.png'

        this.tg.generateCb((err, result) => {
            // [ 'test-thumbnail-320x240-0001.png',
            //  'test-thumbnail-320x240-0002.png',
            //  'test-thumbnail-320x240-0003.png',
            //  'test-thumbnail-320x240-0004.png',
            //  'test-thumbnail-320x240-0005.png',
            //  'test-thumbnail-320x240-0006.png',
            //  'test-thumbnail-320x240-0007.png',
            //  'test-thumbnail-320x240-0008.png',
            //  'test-thumbnail-320x240-0009.png',
            //  'test-thumbnail-320x240-0010.png' ]
        });
    }

    async generateThumbOneByPercentCb() {
        this.tg.generateOneByPercentCb(90, (err, result) => {
            // 'test-thumbnail-320x240-0001.png'
        });
    }

    async generateThumbGif() {
        this.tg.generateGif()
            .then(console.log());
        // '/full/path/to/video-1493133602092.gif'
    }


    async generateThumbGifCb() {
        this.tg.generateGifCb((err, result) => {
            // '/full/path/to/video-1493133602092.gif'
        })
    }
}


module.exports = new VideoThumbnail()
