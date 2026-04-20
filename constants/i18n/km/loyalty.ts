import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'កាក់សន្សំ (Loyalty Coins)',
    hero: {
        totalCoinsLabel: 'ចំនួនកាក់សរុប',
        unit: 'កាក់',
        shopCountLabel: 'ហាង',
        expiringLabel: 'ជិតផុតកំណត់'
    },
    guest: {
        title: 'ចូលគណនីដើម្បីមើលកាក់',
        message: 'ចូលគណនីឥឡូវនេះ ដើម្បីតាមដាន និងស្វែងរកការផ្តល់ជូនប្តូរពិន្ទុពីហាងដែលអ្នកចូលចិត្ត។',
        actionLabel: 'ចូលគណនី'
    },
    shopSection: {
        title: 'កាក់តាមហាង'
    },
    emptyState: {
        title: 'មិនទាន់មានកាក់បញ្ចុះតម្លៃទេ',
        message: 'ទិញទំនិញដើម្បីទទួលបានកាក់ពីហាង។\nប្រើកាក់ដើម្បីទទួលបានការបញ្ចុះតម្លៃសម្រាប់ការបញ្ជាទិញបន្ទាប់របស់អ្នក!',
        shopNowBtn: 'ទិញឥឡូវនេះ'
    },
    howItWorks: {
        title: 'របៀបប្រើកាក់',
        steps: {
            buy: { title: 'ទិញទំនិញ', desc: 'ទទួលបានកាក់នៅពេលការបញ្ជាទិញបានបញ្ចប់' },
            accumulate: { title: 'សន្សំ', desc: 'កាក់ត្រូវបានបញ្ចូលទៅក្នុងគណនីរបស់អ្នកដោយស្វ័យប្រវត្តិ' },
            use: { title: 'ប្រើប្រាស់', desc: 'ប្តូរកាក់ដើម្បីបញ្ចុះតម្លៃនៅពេលទូទាត់ប្រាក់' }
        }
    },
    pdp: {
        chipEarn: 'ទទួលបាន +{{points}} កាក់',
        chipGeneric: 'ទទួលបានកាក់សន្សំ',
        sheetTitle: 'រង្វាន់ពីហាង',
        sheetShop: 'ហាងដែលមានសិទ្ធិ',
        sheetEarn: 'អ្នកនឹងទទួលបាន',
        sheetEarnValue: '+{{points}} កាក់នៅពេលការបញ្ជាទិញត្រូវបានបញ្ចប់',
        sheetCondition: 'លក្ខខណ្ឌ',
        sheetConditionValue: 'កាក់នឹងត្រូវបានបន្ថែមបន្ទាប់ពីការបញ្ជាទិញពីហាងនេះបានបញ្ចប់ដោយជោគជ័យ',
        sheetExpiry: 'សុពលភាព',
        sheetExpiryValue: 'កាក់មានសុពលភាពរយៈពេល {{days}} ថ្ងៃបន្ទាប់ពីត្រូវបានបន្ថែម',
        sheetMaxDiscount: 'ដែនកំណត់ការប្រើប្រាស់',
        sheetMaxDiscountValue: 'ប្រើប្រាស់កាក់សម្រាប់ការបញ្ចុះតម្លៃរហូតដល់ {{percent}}% សម្រាប់ការបញ្ជាទិញបន្ទាប់របស់អ្នក',
    },
    shopDetail: {
        title: 'សមាជិកហាង',
        tabs: {
            batches: 'ប្រតិបត្តិការរង់ចាំ',
            history: 'ប្រវត្តិ',
        },
        hero: {
            availableCoins: 'កាក់ដែលមាន',
            equivalent: 'ស្មើនឹង ₫{{amount}}',
            warningMsg: 'ចំណាំ: {{amount}} កាក់ជិតផុតកំណត់',
            urgentText: 'ប្រើប្រាស់ឥឡូវនេះ!',
            buyNow: 'ទិញឥឡូវនេះ',
            defaultShopName: 'ហាង',
        },
        batchesTab: {
            empty: 'មិនមានប្រតិបត្តិការកាក់ដែលកំពុងរង់ចាំទេ។',
            available: 'អាចប្រើបាន',
            unit: 'កាក់',
        },
        historyTab: {
            expired: 'ផុតកំណត់',
            empty: 'មិនទាន់មានប្រវត្តិទាក់ទងនឹងកាក់ទេ។',
        },
    },
};
