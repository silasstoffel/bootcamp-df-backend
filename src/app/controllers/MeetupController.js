import * as Yup from 'yup';
import { parse, isBefore } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';

const validateSchema = async (model, action = 'create') => {
    const create = {
        title: Yup.string().required(),
        description: Yup.string().required(),
        date: Yup.date().required(),
        hour: Yup.string().required(),
        user_id: Yup.number(),
        file_id: Yup.number().required(),
    };
    let update = {};
    if (action === 'update') {
        update = {
            id: Yup.number()
                .min(1)
                .required(),
        };
    }
    const m = { ...create, ...update };
    const schema = Yup.object().shape(m);
    const check = await schema.isValid(model);
    return check;
};

class MeetupController {
    async store(req, res) {
        if (!(await validateSchema(req.body))) {
            return res
                .status(400)
                .json({ error: true, message: 'Schema inválido' });
        }
        // Não deve ser possível cadastrar meetups com datas que já passaram.
        // https://blog.rocketseat.com.br/datas-e-horarios-javascript-date-fns-moment/
        if (isBefore(parse(req.body.date), new Date())) {
            return res.status(400).json({
                error: true,
                message: 'Data da meetup não pode ser menor que data atual',
            });
        }
        const meetups = await Meetup.create({
            ...req.body,
            user_id: req.userId,
        });
        return res.json(meetups);
    }

    async update(req, res) {
        if (!(await validateSchema(req.body, 'update'))) {
            return res
                .status(400)
                .json({ error: true, message: 'Schema inválido' });
        }
        const { id } = req.body;
        const meetup = await Meetup.findByPk(id);
        if (!meetup) {
            return res.status(400).json({
                error: true,
                message: 'Meetup não encontrada',
            });
        }
        // O usuário também deve poder editar todos dados de meetups que ainda não aconteceram e que ele é organizador.
        if (meetup.user_id !== req.userId) {
            return res.status(400).json({
                error: true,
                message: 'Você não pode editar meetups de outro usuário',
            });
        }

        if (isBefore(parse(meetup.date), new Date())) {
            return res.status(400).json({
                error: true,
                message: 'Meetup só pode ser alterada até a data programada',
            });
        }

        const meetupUpdated = await meetup.update(req.body);
        return res.json(meetupUpdated);
    }

    async index(req, res) {
        // Crie uma rota para listar os meetups com filtro por data (não por hora), os resultados dessa listagem devem
        // vir paginados em 10 itens por página. Abaixo tem um exemplo de chamada para a rota de listagem dos meetups:
        // http://localhost:3333/meetups?date=2019-07-01&page=2
        const { page = 1, date = '' } = req.query;
        const limitResults = 10;
        const where = {};
        if (date) {
            where.date = date;
        }
        const meetups = await Meetup.findAll({
            where,
            limit: limitResults,
            offset: (page - 1) * limitResults,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: true,
                },
            ],
        });
        return res.json(meetups);
    }

    async meetupsUser(req, res) {
        // Crie uma rota para listar os meetups que são organizados pelo usuário logado.
        const meetups = await Meetup.findAll({
            where: { user_id: req.userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    required: true,
                },
            ],
        });
        return res.json(meetups);
    }

    async delete(req, res) {
        const { id } = req.params;
        const meetup = await Meetup.findByPk(id);
        if (!meetup) {
            return res.status(400).json({
                error: true,
                message: 'Meetup não encontrada',
            });
        }
        // O usuário deve poder cancelar meetups organizados por ele e que ainda não aconteceram.
        // O cancelamento deve deletar o meetup da base de dados.
        if (meetup.user_id !== req.userId) {
            return res.status(400).json({
                error: true,
                message: 'Você não pode excluir meetup de outro usuário',
            });
        }

        if (isBefore(parse(meetup.date), new Date())) {
            return res.status(400).json({
                error: true,
                message: 'Meetup só pode ser excluida até a data programada',
            });
        }

        try {
            await meetup.destroy();
            return res.json({});
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: 'Erro ao excluir meetup',
            });
        }
    }

    async load(req, res) {
        const { id } = req.params;
        const meetup = await Meetup.findByPk(id);
        if (!meetup) {
            return res.status(400).json({
                error: true,
                message: 'Meetup não encontrada',
            });
        }
        return res.json(meetup);
    }
}

export default new MeetupController();
