import * as Yup from 'yup';
import { parse, isBefore, format } from 'date-fns';
import Sequelize from 'sequelize';
import Mail from '../../lib/Mail';
import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscription from '../models/Subscription';

const validateSchema = async model => {
    const schema = Yup.object().shape({
        user_id: Yup.number().nullable(),
        meetup_id: Yup.number().required(),
    });
    const check = await schema.isValid(model);
    return check;
};

class SubscriptionController {
    async store(req, res) {
        if (!(await validateSchema(req.body))) {
            return res
                .status(400)
                .json({ error: true, message: 'Schema inválido' });
        }

        const meetup = await Meetup.findByPk(req.body.meetup_id);
        if (!meetup) {
            return res.status(400).json({
                error: true,
                message: 'Meetup não encontrada',
            });
        }
        // O usuário não pode se inscrever em meetups que já aconteceram..
        if (!isBefore(new Date(), parse(meetup.date))) {
            return res.status(400).json({
                error: true,
                message:
                    'Não é possível inscrever em meetup que já aconteceram',
            });
        }

        // O usuário não pode se inscrever no mesmo meetup duas vezes.
        const isSubscribed = await Subscription.findOne({
            where: {
                user_id: req.userId,
                meetup_id: req.body.meetup_id,
            },
        });

        if (isSubscribed) {
            return res.status(400).json({
                error: true,
                message: 'Usuário já está inscrito!',
            });
        }

        const { Op } = Sequelize;
        // O usuário não pode se inscrever em dois meetups que acontecem no mesmo horário.
        // meetups da mesma data e hora da meetup da inscrição
        const meetups = await Meetup.findAll({
            where: {
                date: meetup.date,
                hour: meetup.hour,
                id: { [Op.ne]: meetup.id }, // O id tem que ser diferente da meetup da inscrição
            },
        });

        if (meetups.length) {
            const metupIds = [];
            meetups.map(a => {
                metupIds.push(a.id);
            });

            const subscriptions = await Subscription.findAll({
                where: {
                    user_id: req.userId,
                    meetup_id: {
                        [Op.in]: metupIds,
                    },
                },
            });

            if (subscriptions.length) {
                return res.status(400).json({
                    error: true,
                    message:
                        'Já existe inscrição ativa em um meetup para mesmo horario da meetup a ser incrita!',
                });
            }
        }
        try {
            const subscription = await Subscription.create({
                ...req.body,
                user_id: req.userId,
            });
            // Sempre que um usuário se inscrever no meetup, envie um e-mail ao organizador contendo os dados relacionados
            // ao usuário inscrito. O template do e-mail fica por sua conta :)

            // Inscrito
            const user = await User.findByPk(req.userId);
            // Organizador
            const organizer = await User.findByPk(meetup.user_id);

            await Mail.send({
                to: 'Silas Stoffel <silasstofel@gmail.com>',
                subject: 'Meetup - Nova Inscrição',
                template: 'subscription-meetup',
                context: {
                    user,
                    meetup,
                    organizer,
                },
            });
            return res.json(subscription);
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: `Erro ao criar inscrição. [${error.message}]`,
            });
        }
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
                message: 'Você pode editar meetups de outro usuário',
            });
        }

        const meetupUpdated = await meetup.update(req.body);
        return res.json(meetupUpdated);
    }

    async index(req, res) {
        const { Op } = Sequelize;
        const hoje = format(new Date(), 'YYYY-MM-DD');
        const subscriptions = await Subscription.findAll({
            where: {
                user_id: req.userId,
            },
            include: [
                {
                    model: Meetup,
                    as: 'meetup',
                    attributes: ['id', 'title', 'description', 'date', 'hour', 'file_id', 'address'],
                    where: {
                        date: { [Op.gte]: hoje },
                    },
                    required: true,
					include: [
						{
							model: User,
							as: 'user',
							attributes: ['id', 'name', 'email'],
							required: true,
						}
					]
                },
            ],

            order: [[{ model: Meetup, as: 'meetup' }, 'date', 'ASC']],
        });
        return res.json(subscriptions);
    }

    async delete(req, res) {
        const { id } = req.params;
        const subscription = await Subscription.findByPk(id);
        if (!subscription) {
            return res.status(400).json({
                error: true,
                message: 'Inscrição não encontrada',
            });
        }

        if (subscription.user_id !== req.userId) {
            return res.status(400).json({
                error: true,
                message: 'Você não pode excluir inscrição de outro usuário',
            });
        }

        try {
            await subscription.destroy();
            return res.json({error: false, message: 'Excluído com sucesso'});
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: 'Erro ao excluir meetup',
            });
        }
    }
}

export default new SubscriptionController();
