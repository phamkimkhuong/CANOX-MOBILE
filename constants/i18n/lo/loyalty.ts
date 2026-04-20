import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'ຫຼຽນສະສົມ',
    hero: {
        totalCoinsLabel: 'ຫຼຽນສະສົມທັງໝົດ',
        unit: 'ຫຼຽນ',
        shopCountLabel: 'ຮ້ານຄ້າ',
        expiringLabel: 'ໃກ້ຈະໝົດອາຍຸ'
    },
    guest: {
        title: 'ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງຫຼຽນ',
        message: 'ເຂົ້າສູ່ລະບົບດຽວນີ້ ເພື່ອຕິດຕາມ ແລະ ຮັບສິດທິພິເສດແລກຫຼຽນຈາກຮ້ານຄ້າທີ່ທ່ານມັກ.',
        actionLabel: 'ເຂົ້າສູ່ລະບົບ'
    },
    shopSection: {
        title: 'ຫຼຽນຕາມຮ້ານຄ້າ'
    },
    emptyState: {
        title: 'ຍັງບໍ່ມີຫຼຽນສະສົມ',
        message: 'ຊື້ສິນຄ້າເພື່ອຮັບຫຼຽນສະສົມຈາກຮ້ານຄ້າ.\nໃຊ້ຫຼຽນເພື່ອເປັນສ່ວນຫຼຸດໃນຄຳສັ່ງຊື້ຄັ້ງຕໍ່ໄປ!',
        shopNowBtn: 'ຊື້ເລີຍ'
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
