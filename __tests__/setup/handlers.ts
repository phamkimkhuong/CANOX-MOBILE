import { rest } from 'msw';

export const handlers = [
  // Mock API giỏ hàng
  rest.get(`http://app.test/api/v1/cart`, (req, res, ctx) => {
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
