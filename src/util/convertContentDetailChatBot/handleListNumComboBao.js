function handleListNumComboBao(mangSo) {
    let mangSoTmp = mangSo;

    mangSoTmp = mangSo.map((so) => so.slice(1));

    return mangSoTmp;
}

module.exports = handleListNumComboBao;
