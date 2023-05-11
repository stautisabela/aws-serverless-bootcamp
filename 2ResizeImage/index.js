// everytime a new file is uploaded to an S3 bucket, this lambda function will be triggered and resize the image

const im = require('imagemagick');
const fs = require('fs');
const os = require('os');
const uuidv4 = require('uuid/v4');
const {promisify} = require('util');
const AWS = require('aws-sdk');

// converting callback style functions into functions that return a promise
const resizeAsync = promisify(im.resize);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

AWS.config.update({ region: 'us-east-1' });
const s3 = new AWS.S3();

exports.handler = async(event) => {
    let filesProcessed = event.Records.map( async (record) => {
        // getting S3 bucekt information
        let bucket = record.s3.bucket.name;
        let fileName = record.s3.object.key;

        // getting file from S3 bucket
        var params = {
            Bucket: bucket,
            Key: fileName
        };
        let inputData = await s3.getObject(params).promise();

        // resizing file
        let tempFile = os.tmpdir() + '/' + uuidv4() + '.jpg';
        let resizeArgs = {
            srcData: inputData.Body,
            dstPath: tempFile,
            width: 150
        };
        await resizeAsync(resizeArgs);

        let resizedImage = await readFileAsync(tempFile);

        // uploading resized file to S3 bucket
        let targetFileName = fileName.substring(0, fileName.lastIndexOf('.')) + '-small.jpg';
        var params = {
            Bucket: bucket + '-dest',
            Key: targetFileName,
            Body: new ArrayBuffer(resizedImage),
            ContentType: 'image/jpeg'
        };

        await s3.putObject(params).promise();
        return await unlinkAsync(tempFile);
    });

    await Promise.all(filesProcessed);
    console.log("done");
    return "done";
}