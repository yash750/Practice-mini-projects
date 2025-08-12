

const videoUpload = (req, res) => {
    console.log("File uploaded:", req.file);
    res.status(200).json({ message: "File uploaded successfully" });
}

export {
    videoUpload
}