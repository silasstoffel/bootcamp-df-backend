import path from 'path';
import File from '../models/File';

class FileController {
    async store(req, res) {
        // req.file => nome que o multer coloca para acesso
        // às propeidades de upload
        const { originalname: name, filename: path } = req.file;
        const file = await File.create({ name, path });
        return res.json(file);
    }

    async show(req, res) {
        const { id } = req.params;
        const file = await File.findByPk(id);
        if (!file) {
            return res.status(404);
        }
        const fp = path.resolve(
            __dirname,
            '..',
            '..',
            '..',
            'tmp',
            'uploads',
            file.path
        );
        return res.sendFile(fp);
    }
}

export default new FileController();
