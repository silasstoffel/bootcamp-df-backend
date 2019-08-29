import * as Yup from 'yup';
import User from '../models/User';

class UserController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string()
                .min(6)
                .required(),
        });

        // Valida o schema
        if (!(await schema.isValid(req.body))) {
            return res
                .status(400)
                .json({ error: true, message: 'Schema inválido' });
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
            name: Yup.string(),
            email: Yup.string().email(),
            current_password: Yup.string().nullable(),
            password: Yup.string()
                .nullable()
                .when('current_password', (current_password, field) =>
                    current_password ? field.required() : field
                ),
            confirm_password: Yup.string()
                .nullable()
                .when('password', (password, field) =>
                    password
                        ? field.required().oneOf([Yup.ref('password')])
                        : field
                ),
        });

        // Valida o schema
        if (!(await schema.isValid(req.body))) {
            return res
                .status(400)
                .json({ error: true, message: 'Schema inválido' });
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
