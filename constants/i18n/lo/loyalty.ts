import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'ຫຼຽນ Canox',
    hero: {
        totalCoinsLabel: 'ຫຼຽນສະສົມທັງໝົດ',
        unit: 'ຫຼຽນ',
        shopCountLabel: 'ຮ້ານຄ້າ',
        expiringLabel: 'ໃກ້ຈະໝົດອາຍຸ'
    },
    guestDashboard: {
        hero: {
            title: 'ເຂົ້າລະບົບເພື່ອເບິ່ງຫຼຽນ Canox',
            description: 'ຫຼຽນ Canox ແລະຄະແນນຈາກຮ້ານຖືກບັນທຶກຕາມບັນຊີຂອງທ່ານ. ເຂົ້າລະບົບເພື່ອເບິ່ງຍອດຄົງເຫຼືອ ປະຫວັດ ແລະສິດທິທີ່ໃຊ້ໄດ້.',
            loginAction: 'ເຂົ້າລະບົບ / ລົງທະບຽນ',
        },
        benefits: {
            title: 'ຫຼຽນ Canox ຊ່ວຍທ່ານ',
            discount: {
                title: 'ໃຊ້ຫຼຽນຫຼຸດລາຄາ',
                description: 'ນຳໃຊ້ກັບຄຳສັ່ງຊື້ທີ່ມີເງື່ອນໄຂ',
            },
            balance: {
                title: 'ຕິດຕາມຍອດຄົງເຫຼືອ',
                description: 'ເບິ່ງຫຼຽນທີ່ໃຊ້ໄດ້ ຫຼຽນລໍຖ້າ ແລະໃກ້ໝົດອາຍຸ',
            },
            shop: {
                title: 'ຮັບຄະແນນຈາກຮ້ານ',
                description: 'ສະສົມຄະແນນຈາກຮ້ານທີ່ເຂົ້າຮ່ວມໂຄງການ',
            },
        },
        earn: {
            title: 'ວິທີຮັບຫຼຽນ',
            purchase: 'ຊື້ສິນຄ້າທີ່ມີເງື່ອນໄຂ',
            review: 'ຣີວິວຫຼັງຈາກຮັບສິນຄ້າ',
            program: 'ເຂົ້າຮ່ວມໂຄງການ Canox',
        },
    },
    shopSection: {
        title: 'ຫຼຽນຕາມຮ້ານຄ້າ'
    },
    emptyState: {
        title: 'ຍັງບໍ່ມີຫຼຽນສະສົມ',
        message: 'ຊື້ສິນຄ້າເພື່ອຮັບຫຼຽນສະສົມຈາກຮ້ານຄ້າ.\nໃຊ້ຫຼຽນເພື່ອເປັນສ່ວນຫຼຸດໃນຄຳສັ່ງຊື້ຄັ້ງຕໍ່ໄປ!',
        shopNowBtn: 'ຊື້ເລີຍ'
    },
    emptyDashboard: {
        hero: {
            label: 'ຫຼຽນ Canox ທີ່ໃຊ້ໄດ້',
            description: 'ທ່ານຍັງບໍ່ມີຫຼຽນທີ່ໃຊ້ໄດ້',
            expiryStatus: 'ຍັງບໍ່ມີຫຼຽນລໍຖ້າ ຫຼື ໃກ້ຫມົດອາຍຸ',
            primaryAction: 'ຊື້ສິນຄ້າສະສົມຫຼຽນ',
            secondaryAction: 'ວິທີເຮັດວຽກ',
        },
        shopPoints: {
            title: 'ຄະແນນຈາກຮ້ານ',
            status: 'ຍັງບໍ່ມີຄະແນນທີ່ໃຊ້ໄດ້',
            emptyTitle: 'ທ່ານຍັງບໍ່ມີຄະແນນຈາກຮ້ານ',
            emptyMessage: 'ຊື້ຈາກຮ້ານທີ່ມີໂຄງການຄະແນນ ເພື່ອສະສົມຄະແນນຂອງຮ້ານ.',
            action: 'ເບິ່ງຮ້ານທີ່ໃຫ້ຄະແນນ',
        },
        earn: {
            title: 'ວິທີຮັບຫຼຽນ',
            purchaseTitle: 'ຊື້ສິນຄ້າສະສົມຫຼຽນ',
            reviewTitle: 'ຣີວິວຮັບຫຼຽນ',
            programTitle: 'ໂຄງການ Canox',
            action: 'ສະສົມ',
        },
        history: {
            title: 'ປະຫວັດຫຼ້າສຸດ',
            emptyTitle: 'ຍັງບໍ່ມີທຸລະກຳຫຼຽນ',
            emptyMessage: 'ປະຫວັດການຮັບ ໃຊ້ ຫມົດອາຍຸ ຫຼື ຄືນຫຼຽນ ຈະສະແດງຢູ່ນີ້.',
        },
    },
    guideSheet: {
        title: 'ວິທີເຮັດວຽກ',
        understood: 'ເຂົ້າໃຈແລ້ວ',
        what: {
            title: 'ຫຼຽນ Canox ແມ່ນຫຍັງ?',
            body: 'ຫຼຽນ Canox ແມ່ນຄະແນນລາງວັນທີ່ໃຊ້ເພື່ອຫຼຸດລາຄາຄຳສັ່ງຊື້ທີ່ມີເງື່ອນໄຂໃນ Canox. ຫຼຽນບໍ່ສາມາດແລກເປັນເງິນສົດໄດ້.',
        },
        earn: {
            title: 'ວິທີຮັບຫຼຽນ',
            bullets: {
                purchase: 'ຊື້ສິນຄ້າທີ່ມີເງື່ອນໄຂ',
                review: 'ຣີວິວຫຼັງຈາກຮັບສິນຄ້າ',
                program: 'ເຂົ້າຮ່ວມໂຄງການ Canox',
            },
        },
        use: {
            title: 'ວິທີໃຊ້ຫຼຽນ',
            body: 'ທ່ານສາມາດໃຊ້ຫຼຽນໃນຂັ້ນຕອນຊຳລະເງິນສຳລັບຄຳສັ່ງຊື້ທີ່ມີເງື່ອນໄຂ.',
        },
        available: {
            title: 'ເມື່ອໃດຫຼຽນຈຶ່ງໃຊ້ໄດ້?',
            body: 'ຫຼຽນລາງວັນຈະຖືກເພີ່ມຫຼັງຈາກຄຳສັ່ງຊື້ສຳເລັດ ແລະບໍ່ມີການຍົກເລີກ ຄືນສິນຄ້າ ຫຼື ຄືນເງິນ.',
        },
        note: {
            title: 'ໝາຍເຫດ',
            callout: 'ຫຼຽນອາດມີວັນໝົດອາຍຸ. ກະລຸນາຕິດຕາມຫຼຽນທີ່ໃກ້ໝົດອາຍຸເພື່ອໃຊ້ໃຫ້ທັນເວລາ.',
        },
    },
    howItWorks: {
        title: 'ວິທີການໃຊ້ຫຼຽນ',
        steps: {
            buy: { title: 'ຊື້ສິນຄ້າ', desc: 'ຮັບຫຼຽນເມື່ອຄຳສັ່ງຊື້ສຳເລັດ' },
            accumulate: { title: 'ສະສົມ', desc: 'ຫຼຽນຈະຖືກເພີ່ມເຂົ້າບັນຊີອັດຕະໂນມັດ' },
            use: { title: 'ໃຊ້', desc: 'ແລກຫຼຽນເປັນສ່ວນຫຼຸດເມື່ອຊຳລະເງິນ' }
        }
    },
    pdp: {
        chipEarn: 'ຮັບ +{{points}} ຫຼຽນ',
        chipGeneric: 'ຮັບຫຼຽນສະສົມ',
        sheetTitle: 'ລາງວັນຈາກຮ້ານຄ້າ',
        sheetShop: 'ຮ້ານຄ້າທີ່ຮ່ວມລາຍການ',
        sheetEarn: 'ທ່ານຈະໄດ້ຮັບ',
        sheetEarnValue: '+{{points}} ຫຼຽນ ເມື່ອຄຳສັ່ງຊື້ສຳເລັດ',
        sheetCondition: 'ເງື່ອນໄຂ',
        sheetConditionValue: 'ຫຼຽນຈະຖືກເພີ່ມເຂົ້າບັນຊີ ຫຼັງຈາກຄຳສັ່ງຊື້ສຳເລັດຈາກຮ້ານຄ້ານີ້',
        sheetExpiry: 'ອາຍຸການໃຊ້ງານ',
        sheetExpiryValue: 'ຫຼຽນມີອາຍຸການໃຊ້ງານ {{days}} ມື້ ຫຼັງຈາກໄດ້ຮັບ',
        sheetMaxDiscount: 'ຂີດຈຳກັດການນຳໃຊ້',
        sheetMaxDiscountValue: 'ໃຊ້ຫຼຽນເປັນສ່ວນຫຼຸດໄດ້ສູງສຸດ {{percent}}% ຂອງຄຳສັ່ງຊື້ຄັ້ງຕໍ່ໄປ',
    },
    shopDetail: {
        title: 'ສະມາຊິກຮ້ານຄ້າ',
        tabs: {
            batches: 'ຫຼຽນທີ່ລໍຖ້າອະນຸມັດ',
            history: 'ປະຫວັດ',
        },
        hero: {
            availableCoins: 'ຫຼຽນທີ່ມີຢູ່',
            equivalent: 'ເທົ່າກັບ ₫{{amount}}',
            warningMsg: 'ແຈ້ງເຕືອນ: {{amount}} ຫຼຽນໃກ້ຈະໝົດອາຍຸ',
            urgentText: 'ໃຊ້ດຽວນີ້!',
            buyNow: 'ຊື້ເລີຍ',
            defaultShopName: 'ຮ້ານຄ້າ',
        },
        batchesTab: {
            empty: 'ບໍ່ມີຫຼຽນທີ່ລໍຖ້າອະນຸມັດ.',
            available: 'ນຳໃຊ້ໄດ້',
            unit: 'ຫຼຽນ',
        },
        historyTab: {
            expired: 'ໝົດອາຍຸແລ້ວ',
            empty: 'ຍັງບໍ່ມີປະຫວັດການໃຊ້ຫຼຽນ.',
        },
    },
};
