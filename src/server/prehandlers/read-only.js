import prisma from '../services/prisma.js';
import adminSettings from '../adminSettings.js';

// The secret route
const secretRegex = /^\/api\/secret$/i;

const errorMessage = 'Access denied. You are not allowed to create secrets. 🥲';

export default async function readOnlyHandler(request, reply) {
    const { url } = request;

    if (request.method != "POST" || !secretRegex.test(url)) {
        return;
    }

    const username = request?.user?.username ?? null;

    if (!username && adminSettings.get('read_only')) {
        return reply.code(403).send({ error: errorMessage });
    }

    if (username) {
        const user = await prisma.user.findFirst({
            where: { username },
        });

        if (!['admin', 'creator'].includes(user.role) && adminSettings.get('read_only')) {
            return reply.code(403).send({ error: errorMessage });
        }
    }
}
