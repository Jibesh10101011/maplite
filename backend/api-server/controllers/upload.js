const multer = require("multer");
const upload = multer({storage:multer.memoryStorage()});
const { S3Client,PutObjectCommand } = require("@aws-sdk/client-s3");
const s3Client = new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.S3_CLIENT_ACCESS_KEY_ID,
        secretAccessKey:process.env.S3_CLIENT_SECRET_ACCESS_KEY
    }
});


const handleFileUpload = async(req,res) => {
    try {

        console.log(
            {
                region:process.env.AWS_REGION,
                credentials:{
                    accessKeyId:process.env.S3_CLIENT_ACCESS_KEY_ID,
                    secretAccessKey:process.env.S3_CLIENT_SECRET_ACCESS_KEY
                }
            })

        console.log("Upload Route Clicked!")

        const file = req.file;
        if(!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `Profile/user-static-files/${file.originalname}`,
            Body: file.buffer, // File data
            ContentType: file.mimetype,
        });

        await s3Client.send(command);
        const fileUrl = `${process.env.S3_BUCKET_URL}/${file.originalname}`;
        res.json({ fileUrl });

    } catch(error) {
        console.log("Error = ",error.message);
    }
}

module.exports = { handleFileUpload , upload }
