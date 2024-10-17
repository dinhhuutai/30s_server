function parseDate(dateStr) {
    // Phân tích chuỗi ngày theo định dạng 'dd/mm/yyyy'
    let [day, month, year] = dateStr?.split("/").map(Number);

    if ((year + "").length === 2) {
        year = Number("20" + year);
    }

    // Tạo đối tượng Date (tháng bắt đầu từ 0, nên trừ 1)
    return new Date(year, month - 1, day);
}

module.exports = parseDate;
