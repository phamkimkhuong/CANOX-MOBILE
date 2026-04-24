import { ProductTranslation } from '../types';

export const PRODUCT_STRINGS: ProductTranslation = {
    // === Product Description ===
    description: {
        title: 'ລາຍລະອຽດສິນຄ້າ',
        empty: 'ຍັງບໍ່ມີລາຍລະອຽດ',
        viewMore: 'ເບິ່ງເພີ່ມເຕີມ',
        collapse: 'ຫຍໍ້ເຂົ້າ',
    },

    // === Product Specs ===
    specs: {
        title: 'ຂໍ້ມູນຈຳເພາະ',
        viewMore: 'ເບິ່ງລາຍລະອຽດ',
        collapse: 'ຫຍໍ້ເຂົ້າ',
    },

    // === Variant Selector ===
    variant: {
        label: 'ຕົວເລືອກ',
        placeholder: 'ເລືອກຕົວເລືອກ',
        confirm: 'ຢືນຢັນ',
        addToCart: 'ເພີ່ມລົງໃນກະຕ່າ',
        buyNow: 'ຊື້ເລີຍ',
        stock: 'ຄັງສິນຄ້າ',
        quantity: 'ຈຳນວນ',
        flashSaleBadge: 'ແຟດເຊວ',
        flashSaleCandidateBadge: 'ມີແຟດເຊວ',
        promoBadge: 'ມີໂປຣໂມຊັ່ນ',
        promoCandidateBadge: 'ຂໍ້ສະເໜີພິເສດ',
    },

    // === Sticky Bottom Bar ===
    bottomBar: {
        chat: 'ສົນທະນາ',
        shop: 'ຮ້ານຄ້າ',
        addToCart: 'ເພີ່ມລົງໃນກະຕ່າ',
        buyNow: 'ຊື້ເລີຍ',
        outOfStock: 'ສິນຄ້າໝົດ',
        selectVariant: 'ເລືອກຕົວເລືອກ',
    },

    // === Shop Info ===
    shop: {
        rating: 'ຄະແນນ',
        responseRate: 'ອັດຕາການຕອບກັບ',
        responseTime: 'ເວລາຕອບກັບ',
        completedOrders: 'ຄໍາສັ່ງສໍາເລັດ',
        joined: 'ເຂົ້າຮ່ວມ',
        notAvailable: 'ຍັງບໍ່ມີ',
        products: 'ສິນຄ້າ',
        viewShop: 'ເບິ່ງຮ້ານຄ້າ',
        defaultResponseTime: 'ສອງສາມນາທີ',
        durationDays: '{{count}} ມື້',
        durationMonths: '{{count}} ເດືອນ',
        durationYears: '{{count}} ປີ',
        online: 'ອອນລາຍ',
    },

    // === Product Info ===
    info: {
        reviews: 'ຣີວິວ',
        sold: 'ຂາຍແລ້ວ',
        discount: 'ຫຼຸດ',
        soldCountTemplate: 'ຂາຍແລ້ວ {{soldCount}}',
    },

    // === Flash Sale ===
    flashSale: {
        title: 'ແຟດເຊວ',
        soldOut: 'ໃກ້ຈະໝົດແລ້ວ',
        selling: 'ຂາຍດີ',
        soldPrefix: 'ຂາຍແລ້ວ',
        variantScopeHint: 'ແຟດເຊວໃຊ້ໄດ້ກັບບາງຕົວເລືອກເທົ່ານັ້ນ',
        campaigns: {
            flashSale: 'ແຟດເຊວ',
            megaSale: 'ເມກາເຊວ',
            dailyDeal: '🎁 ດີລປະຈຳວັນ',
            shopSale: 'ໂປຣຮ້ານຄ້າ',
            shopPromotion: 'ໂປຣໂມຊັ່ນຮ້ານ',
        },
    },

    // === Reviews ===
    reviews: {
        title: 'ຄະແນນສິນຄ້າ',
        viewAll: 'ເບິ່ງທັງໝົດ',
        noReviews: 'ຍັງບໍ່ມີຄະແນນ',
        beFirst: 'ເປັນຄົນທຳອິດທີ່ໃຫ້ຄະແນນສິນຄ້ານີ້',
        reviewCount: 'ຄະແນນ',
        filterAll: 'ທັງໝົດ',
        filter5Star: '5 ດາວ',
        filterWithMedia: 'ມີຮູບ/ວິດີໂອ',
        newest: 'ໃໝ່ລ່າສຸດ',
        viewAllReviews: 'ເບິ່ງຣີວິວທັງໝົດສຳລັບລາຍລະອຽດເພີ່ມເຕີມ',
        loading: 'ກຳລັງໂຫລດຣີວິວ...',
    },

    // === Order Protection ===
    orderProtection: {
        cardTitle: 'ນະໂຍບາຍປົກປ້ອງຄໍາສັ່ງຊື້ຂອງ Canox',
        cardSubtitle: 'ຄໍາສັ່ງຊື້ໄດ້ຮັບການປົກປ້ອງເມື່ອຊໍາລະເງິນ ແລະດໍາເນີນການຜ່ານແພລດຟອມ Canox',
        sheetTitle: 'ປົກປ້ອງຄໍາສັ່ງຊື້',
        sheetHeading: 'ນະໂຍບາຍປົກປ້ອງຄໍາສັ່ງຊື້ຂອງ Canox',
        sheetIntro: 'Canox ຊ່ວຍປົກປ້ອງຄໍາສັ່ງຊື້ເມື່ອທຸລະກໍາຖືກຊໍາລະ ແລະດໍາເນີນການຜ່ານແພລດຟອມ.',
        learnMore: 'ຮຽນຮູ້ເພີ່ມ',
        items: {
            payment: {
                summaryTitle: 'ຊໍາລະເງິນປອດໄພ',
                title: 'ຊໍາລະເງິນປອດໄພ',
                description: 'ເລືອກວິທີຊໍາລະເງິນພາຍໃນປະເທດ, ບັດເຄຣດິດ/ເດບິດ, ໂອນຜ່ານທະນາຄານ ຫຼື ກະເປົາເງິນອີເລັກໂທຣນິກ.\nທຸກທຸລະກໍາຜ່ານ Canox ໄດ້ຮັບການປົກປ້ອງດ້ວຍການເຂົ້າລະຫັດ SSL ແລະ ມາດຕະຖານການຮັກສາຄວາມປອດໄພຂໍ້ມູນ PCI DSS ຢ່າງເຄັ່ງຄັດ.',
                policyTitle: 'ນະໂຍບາຍຊໍາລະເງິນ',
            },
            shipping: {
                summaryTitle: 'ຕິດຕາມການຈັດສົ່ງ',
                title: 'ຕິດຕາມການຈັດສົ່ງ',
                description: 'Canox ຊ່ວຍຕິດຕາມສະຖານະຄໍາສັ່ງຊື້ຕັ້ງແຕ່ສັ່ງຊື້ຈົນເຖິງຈັດສົ່ງສໍາເລັດ.',
                policyTitle: 'ນະໂຍບາຍຂົນສົ່ງ',
            },
            return: {
                summaryTitle: 'ປ່ຽນຄືນ - ສົ່ງເງິນຄືນ',
                title: 'ປ່ຽນຄືນຕາມນະໂຍບາຍ',
                description: 'ສົ່ງຄໍາຂໍປ່ຽນຄືນ/ຄືນເງິນ ຖ້າຄໍາສັ່ງຊື້ມີຂໍ້ຜິດພາດ, ບໍ່ຖືກຕ້ອງ ຫຼື ເກີດຄວາມເສຍຫາຍເມື່ອຮອດມືທ່ານ.',
                policyTitle: 'ນະໂຍບາຍປ່ຽນຄືນ ແລະຄືນເງິນ',
            },
            support: {
                summaryTitle: 'ຮ້ອງຮຽນ 24/7',
                title: 'ຊ່ວຍເຫຼືອການຮ້ອງຮຽນ 24/7',
                description: 'ເຂົ້າເຖິງສູນຊ່ວຍເຫຼືອອອນລາຍ 24/7 ຂອງ Canox ຫຼື ຕິດຕໍ່ພະນັກງານເພື່ອຮັບການຊ່ວຍເຫຼືອ ແລະ ແກ້ໄຂບັນຫາກ່ຽວກັບຄຳສັ່ງຊື້.',
                policyTitle: 'ສູນຊ່ວຍເຫຼືອ',
            },
        },
    },

    // === Gallery ===
    gallery: {
        noImages: 'ບໍ່ມີຮູບພາບ',
    },

    // === Error States ===
    error: {
        loadFailed: 'ບໍ່ສາມາດໂຫລດສິນຄ້າໄດ້',
        generic: 'ເກີດຂໍ້ຜິດພາດ',
        retry: 'ລອງໃໝ່',
        notFound: 'ບໍ່ພົບສິນຄ້າ',
        notFoundDetail: 'ສິນຄ້ານີ້ອາດຈະໝົດ ຫຼື ຖືກລຶບໄປແລ້ວ.',
        home: 'ໜ້າຫຼັກ',
        authRequiredTitle: 'ກະລຸນາເຂົ້າສູ່ລະບົບ',
        authRequiredChat: 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເລີ່ມສົນທະນາ',
        authRequiredCart: 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເພີ່ມສິນຄ້າລົງກະຕ່າ',
        authRequiredBuyNow: 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອດຳເນີນການຊື້',
        authRequiredGeneric: 'ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອເຮັດລາຍການນີ້',
    },

    // === Navigation ===
    navigation: {
        title: 'ລາຍລະອຽດສິນຄ້າ',
    },
    related: {
        title: 'ເຈົ້າອາດຈະມັກສິ່ງນີ້',
    },

    // === Badges ===
    badges: {
        mall: 'ມໍລ',
        international: 'ຕ່າງປະເທດ',
    },
    shipping: {
        title: 'ທີ່ຢູ່ຈັດສົ່ງ',
        addressRequired: 'ເລືອກທີ່ຢູ່ເພື່ອກວດສອບການຈັດສົ່ງ',
        internationalOnly: 'ສິນຄ້ານີ້ຮອງຮັບສະເພາະການຈັດສົ່ງຕ່າງປະເທດ. ກະລຸນາປ່ຽນເປັນທີ່ຢູ່ຕ່າງປະເທດ.',
        domesticOnly: 'ສິນຄ້ານີ້ຮອງຮັບສະເພາະການຈັດສົ່ງພາຍໃນປະເທດ. ກະລຸນາປ່ຽນເປັນທີ່ຢູ່ພາຍໃນປະເທດ.',
    },
    share: {
        msgTemplate: 'ເຂົ້າເບິ່ງສິນຄ້ານີ້ໃນ Calatha: {{name}}\n{{url}}',
    },
    report: {
        title: 'ລາຍງານສິນຄ້າ',
        success: 'ຂອບໃຈສຳລັບການລາຍງານ. ພວກເຮົາຈະກວດສອບສິນຄ້ານີ້ໂດຍໄວ.',
        reasons: {
            fake: 'ສິນຄ້າປອມ/ລອກລຽນແບບ',
            prohibited: 'ສິນຄ້າຫ້າມຂາຍ',
            offensive: 'ເນື້ອຫາບໍ່ເໝາະສົມ',
            scam: 'ສະແປມ ຫຼື ຫຼອກລວງ',
            misleading: 'ຂໍ້ມູນສ້າງຄວາມເຂົ້າໃຈຜິດ',
            other: 'ເຫດຜົນອື່ນໆ',
        },
    },
    priceBreakdown: {
        title: 'ລາຍລະອຽດລາຄາ',
        basePrice: 'ລາຄາສິນຄ້າ',
        productDiscount: 'ສ່ວນຫຼຸດສິນຄ້າ',
        shopVoucher: 'ບັດສ່ວນຫຼຸດຮ້ານຄ້າ',
        platformVoucher: 'ບັດສ່ວນຫຼຸດ CanoX',
        finalSubtotal: 'ຍອດລວມ',
        legalNote: '* ລາຄາສຸດທ້າຍອາດມີການປ່ຽນແປງຂຶ້ນກັບຄ່າຈັດສົ່ງ ແລະ ໂປຣໂມຊັ່ນອື່ນໆຕອນຊຳລະເງິນ.',
        afterVoucher: 'ລາຄາຫຼັງຫັກສ່ວນຫຼຸດ',
    },
    // === Wishlist Notices in Card ===
    wishlist: {
        targetPrice: 'ລາຄາເປົ້າໝາຍ',
        setupTargetPrice: 'ຕັ້ງຄ່າລາຄາເປົ້າໝາຍ (ກົດຄ້າງ)',
        hasNotes: 'ມີບັນທຶກ',
    },
    // === Packaging Info ===
    packaging: {
        title: 'ການບັນຈຸພັນ',
        dimensions: 'ຂະໜາດ',
        weight: 'ນ້ຳໜັກ',
    },
};
