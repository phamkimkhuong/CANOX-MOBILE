import { NotificationTranslation } from '../types';

export const NOTIFICATION_STRINGS: NotificationTranslation = {
    header: {
        title: 'ការជូនដំណឹង',
        markAllRead: 'សម្គាល់ថាបានអានទាំងអស់',
    },
    filters: {
        all: 'ទាំងអស់',
        order: 'ការបញ្ជាទិញ',
        promo: 'ការផ្តល់ជូន',
        product: 'ផលិតផល',
        shipping: 'ការដឹកជញ្ជូន',
        wallet: 'កាបូប & សេវាកម្ម',
        system: 'ប្រព័ន្ធ',
    },
    empty: {
        title: 'មិនទាន់មានការជូនដំណឹងទេ',
        subtitle: 'អ្នកនឹងទទួលបានព័ត៌មានថ្មីៗអំពីការបញ្ជាទិញនិងការផ្តល់ជូននៅទីនេះ',
        subtitleWithFilter: 'អ្នកមិនមានការជូនដំណឹងនៅក្នុង "{{filter}}" ទេ',
    },
    sections: {
        today: 'ថ្ងៃនេះ',
        yesterday: 'ម្សិលមិញ',
        thisWeek: 'សប្តាហ៍នេះ',
        earlier: 'ពីមុន',
    },
    errors: {
        markAllAsReadFailed: 'បរាជ័យក្នុងការសម្គាល់ថាបានអានទាំងអស់',
        tryAgain: 'សូមព្យាយាមម្តងទៀត។',
    },
    actions: {
        markAllAsReadTitle: 'សម្គាល់ថាបានអានទាំងអស់',
        markAllAsReadMessage: 'តើអ្នកចង់សម្គាល់ការជូនដំណឹងទាំងអស់ថាបានអានទេ?',
    },
    settings: {
        title: 'ការកំណត់ការជូនដំណឹង',
        systemDisabled: {
            title: 'ការជូនដំណឹងត្រូវបានបិទ',
            description: 'អ្នកត្រូវបើកការជូនដំណឹងនៅក្នុងការកំណត់ទូរស័ព្ទ ដើម្បីទទួលបានព័ត៌មានពីការបញ្ជាទិញ។',
            action: 'បើកការកំណត់ទូរស័ព្ទ',
        },
        groups: {
            transaction: {
                title: 'ប្រតិបត្តិការ & ផ្ទាល់ខ្លួន',
                order: {
                    title: 'ព័ត៌មានថ្មីៗពីការបញ្ជាទិញ',
                    description: 'ការជូនដំណឹងនៅពេលស្ថានភាពការបញ្ជាទិញផ្លាស់ប្តូរ ឬអ្នកដឹកជញ្ជូនចាប់ផ្តើមបញ្ជូន។',
                },
                chat: {
                    title: 'សារថ្មីៗ',
                    description: 'ទទួលបានការជូនដំណឹងសម្រាប់សារពីហាង ឬផ្នែកបម្រើអតិថិជន។',
                },
            },
            promotion: {
                title: 'ការផ្តល់ជូន & ព័ត៌មាន',
                deals: {
                    title: 'ការផ្តល់ជូនពិសេស',
                    description: 'Flash Sales, ប័ណ្ណបញ្ចុះតម្លៃផ្តាច់មុខ និងកាដូប្រចាំថ្ងៃ។',
                },
                news: {
                    title: 'ព័ត៌មានពី CanoX',
                    description: 'ស្វែងរកមុខងារថ្មីៗ គន្លឹះទិញទំនិញ និងព័ត៌មានសហគមន៍ពី CanoX។',
                },
            },
            advanced: {
                title: 'កម្រិតខ្ពស់',
                systemSettings: 'ការកំណត់ការជូនដំណឹងក្នុងទូរស័ព្ទ',
            },
        },
        messages: {
            enableSuccess: 'បានបើកការជូនដំណឹង {{topic}}',
            disableSuccess: 'បានបិទការជូនដំណឹង {{topic}}',
            updateError: 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពការកំណត់',
            featureDeveloping: 'មុខងារកំពុងអភិវឌ្ឍន៍',
        },
    },
    softAsk: {
        title: 'តាមដានការបញ្ជាទិញរបស់អ្នក',
        description: 'តើអ្នកចង់ទទួលបានការជូនដំណឹង ភ្លាមៗនៅពេលស្ថានភាពការបញ្ជាទិញផ្លាស់ប្តូរ និងនៅពេលអ្នកដឹកជញ្ជូនចាប់ផ្តើមបញ្ជូនដែរឬទេ?',
        accept: 'យល់ព្រម',
        later: 'ពេលក្រោយ',
    },
    authRequired: {
        title: 'ចូលគណនីដើម្បីមើលការជូនដំណឹង',
        login: 'ចូលគណនីឥឡូវនេះ',
    },
};
