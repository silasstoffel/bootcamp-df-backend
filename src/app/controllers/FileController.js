import * as Yup from 'yup';
import path from 'path';
import File from '../models/File';

class FileController {
    async store(req, res) {
        // req.file => nome que o multer coloca para acesso
        // às propriedades de upload
        const schema = Yup.object().shape({
            filename: Yup.string().required(
                'propriedade/atributo filename do arquivo de upload é obrigatório'
            ),
            originalname: Yup.string().required(
                'propriedade/atributo originalname do arquivo de upload é obrigatório'
            ),
        });
        try {
            await schema.validateSync(req.file);
            const { originalname: name, filename: path } = req.file;
            const file = await File.create({ name, path });
            return res.json(file);
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }
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
