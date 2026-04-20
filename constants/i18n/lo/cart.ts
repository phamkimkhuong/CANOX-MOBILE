import { CartTranslation } from '../types';

export const CART_STRINGS: CartTranslation = {
    header: {
        title: 'ກະຕ່າ',
        edit: 'ແກ້ໄຂ',
        done: 'ສຳເລັດ',
        viewShop: 'ເບິ່ງຮ້ານ {{shopName}}',
    },
    empty: {
        title: 'ລົດເຂັນຂອງທ່ານຫວ່າງເປົ່າ',
        subtitle: 'ໄປເພີ່ມບາງຜະລິດຕະພັນໃນກະຕ່າຂອງທ່ານ!',
        shopNow: 'ຊື້ເລີຍ',
    },
    authRequired: {
        title: 'ກະຕ່າສິນຄ້າຂອງທ່ານຫວ່າງເປົ່າ',
        login: 'ເຂົ້າສູ່ລະບົບດຽວນີ້',
    },
    footer: {
        selectAll: 'ທັງໝົດ',
        total: 'ຍອດຊໍາລະ',
        checkout: 'ຊໍາລະເງິນ',
        savings: 'ປະຢັດ {{amount}}',
        checkoutWithCount: 'ຊໍາລະເງິນ ({{count}})',
        moveToWishlist: 'ຍ້າຍໄປລາຍການທີ່ຕ້ອງການ',
        deleteSelected: 'ລຶບ',
    },
    confirmations: {
        deleteSelected: {
            title: 'ລຶບລາຍການ',
            message: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ {{count}} ລາຍການທີ່ເລືອກ?',
        },
    },
    item: {
        variation: 'ຕົວເລືອກ',
        delete: 'ລຶບ',
        outOfStock: 'ສິນຄ້າໝົດ',
        findSimilar: 'ຊອກຫາສິນຄ້າຄ້າຍຄືກັນ',
        selectVariation: 'ເລືອກຕົວເລືອກ',
        unsupportedRegion: 'ບໍ່ຮອງຮັບການຈັດສົ່ງໄປຍັງປາຍທາງ {{location}}.',
        promoStockWarning: 'ເຫຼືອພຽງ {{count}} ລາຍການໃນລາຄານີ້',
    },
    status: {
        syncing: 'ກຳລັງອັບເດດລາຄາລ່າສຸດ...',
        promotionSyncing: 'ກຳລັງອັບເດດລາຄາ...',
        rebuySuccess: 'ຊື້ອີກຄັ້ງສຳເລັດ',
        rebuySuccessDetail: 'ເພີ່ມຜະລິດຕະພັນລົງໃນກະຕ່າແລ້ວ',
        addSuccess: 'ເພີ່ມລົງໃນກະຕ່າແລ້ວ',
        addFailed: 'ບໍ່ສາມາດເພີ່ມລົງໃນກະຕ່າໄດ້',
    },
    error: {
        loadFailed: 'ບໍ່ສາມາດໂຫລດກະຕ່າໄດ້',
        tryAgainLater: 'ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ',
        retryButton: 'ລອງໃໝ່',
    },
};
