import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'កាក់ TCano',
    guestDashboard: {
        hero: {
            title: 'ចូលគណនីដើម្បីមើលកាក់ TCano',
            description: 'កាក់ TCano និងពិន្ទុពីហាងត្រូវបានរក្សាទុកតាមគណនីរបស់អ្នក។ ចូលគណនីដើម្បីមើលសមតុល្យ ប្រវត្តិ និងអត្ថប្រយោជន៍ដែលអាចប្រើបាន។',
            loginAction: 'ចូល / ចុះឈ្មោះ',
        },
        benefits: {
            title: 'កាក់ TCano ជួយអ្នក',
            discount: {
                title: 'ប្រើកាក់បញ្ចុះតម្លៃ',
                description: 'អនុវត្តលើការបញ្ជាទិញដែលមានលក្ខខណ្ឌ',
            },
            balance: {
                title: 'តាមដានសមតុល្យ',
                description: 'មើលកាក់ដែលអាចប្រើបាន កាក់រង់ចាំ និងជិតផុតកំណត់',
            },
            shop: {
                title: 'ទទួលពិន្ទុពីហាង',
                description: 'សន្សំពិន្ទុពីហាងដែលចូលរួមកម្មវិធី',
            },
        },
        earn: {
            title: 'វិធីរកកាក់',
            purchase: 'ទិញទំនិញដែលមានលក្ខខណ្ឌ',
            review: 'វាយតម្លៃបន្ទាប់ពីទទួលទំនិញ',
            program: 'ចូលរួមកម្មវិធី TCano',
        },
    },
    overviewDashboard: {
        hero: {
            platformLabel: 'កាក់ TCano ដែលអាចប្រើបាន',
            combinedLabel: 'ពិន្ទុសរុបដែលអាចប្រើបាន',
            platformDescription: 'អាចបញ្ចុះតម្លៃបានដល់ {{amount}}đ',
            combinedDescription: 'អាចប្រើបានតាមលក្ខខណ្ឌរបស់ហាងនីមួយៗ',
            coinUnit: 'កាក់',
            pointUnit: 'ពិន្ទុ',
            expiringTemplate: 'ជិតផុតកំណត់: {{amount}} {{unit}} · {{source}} · {{date}}',
            useNow: 'ប្រើឥឡូវនេះ',
            howItWorks: 'របៀបដំណើរការ',
        },
        shopPoints: {
            unit: 'ពិន្ទុ',
            shopOnlyBadge: 'ប្រើនៅហាងនេះ',
        },
    },
    shopSection: {
        title: 'ពិន្ទុពីហាង',
        availableCount: 'មាន {{count}} ហាងដែលមានពិន្ទុអាចប្រើបាន',
    },
    emptyState: {
        title: 'មិនទាន់មានកាក់បញ្ចុះតម្លៃទេ',
        message: 'ទិញទំនិញដើម្បីទទួលបានកាក់ពីហាង។\nប្រើកាក់ដើម្បីទទួលបានការបញ្ចុះតម្លៃសម្រាប់ការបញ្ជាទិញបន្ទាប់របស់អ្នក!',
        shopNowBtn: 'ទិញឥឡូវនេះ'
    },
    emptyDashboard: {
        hero: {
            label: 'កាក់ TCano ដែលអាចប្រើបាន',
            description: 'អ្នកមិនទាន់មានកាក់ដែលអាចប្រើបានទេ',
            expiryStatus: 'មិនទាន់មានកាក់រង់ចាំ ឬជិតផុតកំណត់ទេ',
            primaryAction: 'ទិញដើម្បីសន្សំកាក់',
            secondaryAction: 'របៀបដំណើរការ',
        },
        shopPoints: {
            title: 'ពិន្ទុពីហាង',
            status: 'មិនមានពិន្ទុដែលអាចប្រើបាន',
            emptyTitle: 'អ្នកមិនទាន់មានពិន្ទុពីហាងទេ',
            emptyMessage: 'ទិញពីហាងដែលមានកម្មវិធីពិន្ទុ ដើម្បីសន្សំពិន្ទុរបស់ហាងនោះ។',
            action: 'មើលហាងផ្តល់ពិន្ទុ',
        },
        earn: {
            title: 'វិធីរកកាក់',
            purchaseTitle: 'ទិញទំនិញសន្សំកាក់',
            reviewTitle: 'វាយតម្លៃទទួលកាក់',
            programTitle: 'កម្មវិធី TCano',
            action: 'សន្សំកាក់',
        },
        history: {
            title: 'ប្រវត្តិថ្មីៗ',
            emptyTitle: 'មិនទាន់មានប្រតិបត្តិការកាក់',
            emptyMessage: 'ប្រវត្តិទទួល ប្រើ ផុតកំណត់ ឬសងកាក់ នឹងបង្ហាញនៅទីនេះ។',
        },
    },
    guideSheet: {
        title: 'របៀបដំណើរការ',
        understood: 'យល់ហើយ',
        what: {
            title: 'កាក់ TCano គឺជាអ្វី?',
            body: 'កាក់ TCano គឺជាពិន្ទុរង្វាន់សម្រាប់បញ្ចុះតម្លៃលើការបញ្ជាទិញដែលមានលក្ខខណ្ឌលើ TCano។ កាក់មិនអាចប្ដូរជាសាច់ប្រាក់បានទេ។',
        },
        earn: {
            title: 'របៀបរកកាក់',
            bullets: {
                purchase: 'ទិញទំនិញដែលមានលក្ខខណ្ឌ',
                review: 'វាយតម្លៃបន្ទាប់ពីទទួលទំនិញ',
                program: 'ចូលរួមកម្មវិធី TCano',
            },
        },
        use: {
            title: 'របៀបប្រើកាក់',
            body: 'អ្នកអាចប្រើកាក់នៅពេលទូទាត់ប្រាក់សម្រាប់ការបញ្ជាទិញដែលមានលក្ខខណ្ឌ។',
        },
        available: {
            title: 'ពេលណាកាក់អាចប្រើបាន?',
            body: 'កាក់រង្វាន់នឹងត្រូវបានបញ្ចូលបន្ទាប់ពីការបញ្ជាទិញបានបញ្ចប់ ហើយមិនមានការលុបចោល បង្វិលសង ឬសងប្រាក់ទេ។',
        },
        note: {
            title: 'ចំណាំ',
            callout: 'កាក់អាចមានថ្ងៃផុតកំណត់។ សូមតាមដានកាក់ជិតផុតកំណត់ ដើម្បីប្រើឱ្យទាន់ពេល។',
        },
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
