import jwt from 'jsonwebtoken';
import User from '../models/User';

class SessionController {
    async store(req, res) {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                error: true,
                message: 'Usuario não encontrado',
            });
        }
        if (!(await user.checkPassword(password))) {
            return res.status(401).json({
                error: true,
                message: 'Senha inválida',
            });
        }
        const { id, name } = user;
        return res.json({
            id,
            email,
            name,
            token: jwt.sign({ id }, process.env.APP_SECRET, {
                expiresIn: parseInt(process.env.APP_TOKEN_EXPIRES_IN, 10),
            }),
        });
    }
}

export default new SessionController();
