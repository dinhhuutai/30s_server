function payDaThang(content, info, kqxs) {
    let diem = 0;
    let tienxac = 0;
    let tientrung = 0;
    let quantitySoTrung = 0;


    diem = content.price * 2 * (content.domain === 'mn' || content.domain === 'mt' ? 18 : content.domain === 'mb' ? 27 : 1);

    tienxac =
        diem * (content.domain === 'mn' ? info.codathangMN : content.domain === 'mt' ? info.codathangMT : info.codathangMB);

    let hasSo1 = false;
    let hasSo2 = false;

    kqxs.map((eKq) => {
        if (content.province.includes(eKq.province)) {
            eKq.result.map((s, i) => {
                if (s.length >= content.number[0].length && s.endsWith(content.number[0])) {
                    quantitySoTrung += 1;
                    hasSo1 = true;
                }

                if (s.length >= content.number[1].length && s.endsWith(content.number[1])) {
                    quantitySoTrung += 1;
                    hasSo2 = true;
                }
            });
        }
    });

    if (hasSo1 && hasSo2) {
        quantitySoTrung /= 2;
    } else {
        quantitySoTrung = 0;
    }

    tientrung =
        content.price *
        quantitySoTrung *
        (content.domain === 'mn'
            ? info.trungdathangMN
            : content.domain === 'mt'
            ? info.trungdathangMT
            : info.trungdathangMB);

    return {
        diem: diem,
        tienxac: tienxac,
        tientrung: tientrung,
        quantityLike: quantitySoTrung,
    };
}

module.exports = payDaThang;
