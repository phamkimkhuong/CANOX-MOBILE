import { http, HttpResponse } from 'msw';

export const cartHandlers = [
    // Get cart
    http.get('http://app.test/api/v1/cart', () => {
        return HttpResponse.json({
            data: {
                items: [],
                totalQuantity: 0,
            },
        }, { status: 200 });
    }),
];
