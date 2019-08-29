import * as Yup from 'yup';
import User from '../models/User';

class UserController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string()
                .nullable()
                .required('Nome é obrigatório'),
            email: Yup.string()
                .nullable()
                .email('Informe um e-mail válido')
                .required('E-mail é obrigatório'),
            password: Yup.string()
                .nullable()
                .min(6, 'Senha precisa ter no mínimo 6 caracteres')
                .required('Senha é obrigatório'),
        });

        try {
            await schema.validateSync(req.body);
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const exists = await User.findOne({ where: { email: req.body.email } });
        if (exists) {
            return res
                .status(400)
                .json({ error: true, message: 'Usuario já existe' });
        }
        const { id, email, name } = await User.create(req.body);
        return res.json({ id, email, name });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string()
                .nullable()
                .required('Nome é obrigatório'),
            email: Yup.string()
                .email('Informe um e-mail válido')
                .required('E-mail'),
            current_password: Yup.string().nullable(),
            password: Yup.string()
                .nullable()
                .when('current_password', (current_password, field) =>
                    current_password
                        ? field.required('Senha atual é obrigatória')
                        : field
                ),
            confirm_password: Yup.string()
                .nullable()
                .when('password', (password, field) =>
                    password
                        ? field
                              .required('Confirmação da senha é obrigatória')
                              .oneOf(
                                  [Yup.ref('password')],
                                  'A confirmação da senha não é válida'
                              )
                        : field
                ),
        });

        try {
            await schema.validateSync(req.body);
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: error.message,
            });
        }

        const { email, current_password } = req.body;
        const user = await User.findByPk(req.userId);

        // Se mudar o e-mail, verificar se o e-mail já existe
        if (email !== user.email) {
            const exists = await User.findOne({
                where: { email },
            });
            if (exists) {
                return res.status(400).json({
                    error: true,
                    message: 'Já existe um usuario com esse e-mail',
                });
            }
        }

        // Senha antiga bate?
        if (current_password && !(await user.checkPassword(current_password))) {
            return res.status(401).json({
                error: true,
                message: 'Senha atual não é válida',
            });
        }
        const { id, name } = await user.update(req.body);
        return res.json({ id, email, name });
    }
}

export default new UserController();
