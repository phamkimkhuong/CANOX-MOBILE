/**
 * ==============================================
 * SEARCH TRANSLATIONS - English
 * ==============================================
 */

import type { SearchTranslation } from '../types';

export const SEARCH_STRINGS: SearchTranslation = {
    header: {
        placeholder: 'ມື້ນີ້ທ່ານກຳລັງຊອກຫາຫຍັງແດ່?',
        placeholderTyping: 'ຄົ້ນຫາສິນຄ້າ, ຮ້ານຄ້າ...',
        cancel: 'ຍົກເລີກ',
    },
    recent: {
        title: 'ປະຫວັດການຄົ້ນຫາ',
        clearAll: 'ລຶບທັງໝົດ',
        empty: 'ບໍ່ມີປະຫວັດການຄົ້ນຫາ',
    },
    hot: {
        title: 'ຍອດຮິດ',
        badge: 'HOT',
    },
    suggestions: {
        searchIn: 'ຄົ້ນຫາໃນ',
        shopPrefix: 'ຮ້ານຄ້າ',
        categoryPrefix: 'ໝວດໝູ່',
        noResults: 'ບໍ່ພົບຄຳແນະນຳ',
    },
    actions: {
        search: 'ຄົ້ນຫາ',
        searchByImage: 'ຄົ້ນຫາດ້ວຍຮູບພາບ',
        searchByVoice: 'ຄົ້ນຫາດ້ວຍສຽງ',
    },
    error: {
        loadFailed: 'ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ. ກະລຸນາລອງໃໝ່.',
    },
    // Search Results Screen
    results: {
        title: 'ຜົນການຄົ້ນຫາ',
        count: '{{count}} ສິນຄ້າ',
        countPlural: '{{count}} ສິນຄ້າ',
        filter: 'ຕົວກອງ',
        filterCount: 'ຕົວກອງ ({{count}})',
    },
    sort: {
        relevance: 'ກ່ຽວຂ້ອງ',
        newest: 'ໃໝ່ລ່າສຸດ',
        international: 'ສາກົນ',
        price: 'ລາຄາ',
        priceAsc: 'ລາຄາ: ຕ່ຳຫາສູງ',
        priceDesc: 'ລາຄາ: ສູງຫາຕ່ຳ',
    },
    quickFilter: {
        freeship: 'ສົ່ງຟຣີ',
        express: 'ດ່ວນ',
        rating4Plus: '4 ດາວຂຶ້ນໄປ',
        mall: 'Mall',
        voucher: 'ມີຄູປ໋ອງ',
    },
    filterModal: {
        title: 'ຕົວກອງ',
        reset: 'ຕັ້ງຄ່າໃໝ່',
        apply: 'ນຳໃຊ້',
        priceRange: 'ຊ່ວງລາຄາ',
        priceMin: 'ລາຄາຕ່ຳສຸດ',
        priceMax: 'ລາຄາສູງສຸດ',
        rating: 'ຄະແນນ',
        ratingFrom: 'ຕັ້ງແຕ່ {{rating}} ດາວ',
        category: 'ໝວດໝູ່',
        location: 'ສະຖານທີ່',
        allLocations: 'ທັງໝົດ',
    },
    empty: {
        title: 'ບໍ່ພົບສິນຄ້າ',
        subtitle: 'ບໍ່ພົບຜົນການຄົ້ນຫາສຳລັບ "{{keyword}}"',
        suggestion: 'ທ່ານອາດຈະມັກ',
        tryAgain: 'ລອງຄົ້ນຫາໃໝ່',
        adjustFilters: 'ຫຼື ປັບປ່ຽນຕົວກອງ',
    },
};
