import { NotificationTranslation } from '../types';

export const NOTIFICATION_STRINGS: NotificationTranslation = {
    header: {
        title: 'ການແຈ້ງເຕືອນ',
        markAllRead: 'ໝາຍວ່າອ່ານທັງໝົດແລ້ວ',
    },
    filters: {
        all: 'ທັງໝົດ',
        order: 'ຄຳສັ່ງຊື້',
        promo: 'ໂປຣໂມຊັ່ນ',
        product: 'ສິນຄ້າ',
        shipping: 'ການຈັດສົ່ງ',
        wallet: 'ກະເປົາເງິນ & ບໍລິການ',
        system: 'ລະບົບ',
    },
    empty: {
        title: 'ຍັງບໍ່ມີການແຈ້ງເຕືອນ',
        subtitle: 'ທ່ານຈະໄດ້ຮັບການອັບເດດກ່ຽວກັບຄຳສັ່ງຊື້ ແລະ ໂປຣໂມຊັ່ນຢູ່ທີ່ນີ້',
        subtitleWithFilter: 'ທ່ານບໍ່ມີການແຈ້ງເຕືອນໃນ "{{filter}}"',
    },
    sections: {
        today: 'ມື້ນີ້',
        yesterday: 'ມື້ວານນີ້',
        thisWeek: 'ອາທິດນີ້',
        earlier: 'ກ່ອນໜ້ານີ້',
    },
    errors: {
        markAllAsReadFailed: 'ບໍ່ສາມາດໝາຍວ່າອ່ານທັງໝົດແລ້ວ',
        tryAgain: 'ກະລຸນາລອງໃໝ່.',
    },
    actions: {
        markAllAsReadTitle: 'ໝາຍວ່າອ່ານທັງໝົດແລ້ວ',
        markAllAsReadMessage: 'ທ່ານຕ້ອງການໝາຍການແຈ້ງເຕືອນທັງໝົດວ່າອ່ານແລ້ວບໍ່?',
    },
    settings: {
        title: 'ຕັ້ງຄ່າການແຈ້ງເຕືອນ',
        systemDisabled: {
            title: 'ປິດການແຈ້ງເຕືອນແລ້ວ',
            description: 'ທ່ານຕ້ອງເປີດການແຈ້ງເຕືອນໃນການຕັ້ງຄ່າໂທລະສັບເພື່ອຮັບການອັບເດດຄຳສັ່ງຊື້.',
            action: 'ເປີດການຕັ້ງຄ່າໂທລະສັບ',
        },
        groups: {
            transaction: {
                title: 'ທຸລະກຳ & ສ່ວນຕົວ',
                order: {
                    title: 'ອັບເດດຄຳສັ່ງຊື້',
                    description: 'ແຈ້ງເຕືອນເມື່ອສະຖານະຄຳສັ່ງຊື້ປ່ຽນແປງ ຫຼື ຜູ້ຈັດສົ່ງເລີ່ມຈັດສົ່ງ.',
                },
                chat: {
                    title: 'ຂໍ້ຄວາມໃໝ່',
                    description: 'ຮັບການແຈ້ງເຕືອນສຳລັບຂໍ້ຄວາມຈາກຮ້ານຄ້າ ຫຼື ຝ່າຍສະໜັບສະໜູນລູກຄ້າ.',
                },
            },
            promotion: {
                title: 'ໂປຣໂມຊັ່ນ & ຂ່າວສານ',
                deals: {
                    title: 'ໂປຣໂມຊັ່ນ & ຂໍ້ສະເໜີ',
                    description: 'ແຟດເຊວ, ບັດສ່ວນຫຼຸດພິເສດ, ແລະ ຂອງຂວັນປະຈຳວັນ.',
                },
                news: {
                    title: 'ຂ່າວສານ TCano',
                    description: 'ຄົ້ນພົບຄຸນສົມບັດໃໝ່, ເຄັດລັບການຊື້ເຄື່ອງ, ແລະ ອັບເດດຊຸມຊົນຈາກ TCano.',
                },
            },
            advanced: {
                title: 'ຂັ້ນສູງ',
                systemSettings: 'ຕັ້ງຄ່າການແຈ້ງເຕືອນໂທລະສັບ',
            },
        },
        messages: {
            enableSuccess: 'ເປີດການແຈ້ງເຕືອນ {{topic}} ແລ້ວ',
            disableSuccess: 'ປິດການແຈ້ງເຕືອນ {{topic}} ແລ້ວ',
            updateError: 'ບໍ່ສາມາດອັບເດດການຕັ້ງຄ່າໄດ້',
            featureDeveloping: 'ຄຸນສົມບັດກຳລັງພັດທະນາ',
        },
    },
    softAsk: {
        title: 'ຕິດຕາມຄຳສັ່ງຊື້ຂອງທ່ານ',
        description: 'ທ່ານຕ້ອງການຮັບການແຈ້ງເຕືອນທັນທີທີ່ສະຖານະຄຳສັ່ງຊື້ຂອງທ່ານປ່ຽນແປງ ແລະ ເມື່ອຜູ້ຈັດສົ່ງເລີ່ມຈັດສົ່ງບໍ່?',
        accept: 'ຕົກລົງ',
        later: 'ພາຍຫຼັງ',
    },
    authRequired: {
        title: 'ເຂົ້າສູ່ລະບົບເພື່ອເບິ່ງການແຈ້ງເຕືອນ',
        login: 'ເຂົ້າສູ່ລະບົບດຽວນີ້',
    },
};
