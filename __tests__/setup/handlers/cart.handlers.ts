import { rest } from 'msw';

export const cartHandlers = [
    // Get cart
    rest.get('http://app.test/api/v1/cart', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                data: {
                    items: [],
                    totalQuantity: 0,
                },
            })
        );
    }),
];
