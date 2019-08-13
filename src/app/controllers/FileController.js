import File from '../models/File';

class FileController {
    async store(req, res) {
        // req.file => nome que o multer coloca para acesso
        // às propeidades de upload
        const { originalname: name, filename: path } = req.file;
        const file = await File.create({ name, path });
        return res.json(file);
    }
}

export default new FileController();
