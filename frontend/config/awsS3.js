export const s3Client = new S3Client({
    region:"ap-south-1",
    credentials: {
        accessKeyId:"",
        secretAccessKey:""
    }
});

export async function getObjectURL(key) {
    const command = GetObjectCommand({
        Bucket:"mapelite-static-files",
        key:key
    });

    const url = await getSignedUrl(s3Client,command);
    return url;
}


export async function putObject(filename,contentType) {
    const command = new PutObjectCommand({
        Bucket:"mapelite-static-files",
        key:`/uploads/user-uploads/${filename}`,
        contentType:contentType
    });

    const url  = await getSignedUrl(s3Client,command);
    return url;
}
