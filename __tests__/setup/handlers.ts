import { rest } from 'msw';

export const handlers = [
  rest.get('https://api.calatha.com/v3/api-docs', (req, res, ctx) => {
    return res(ctx.json({}));
  })
];
