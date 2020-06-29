process.env.TESSDATA_PREFIX = './routes/modules/tesseract/tessdata'
const tesseract = require("node-tesseract-ocr")
const ImageDataURI = require('image-data-uri')
const fs = require("fs")
const er = require("./elements-recognition")
const resizebase64 = require('resize-base64')
var stringSimilarity = require('string-similarity')

exports.convertOne = async (req, res) => {
    try {
        var elements = {}
        await ImageDataURI.outputFile(req.body.dataURL, './src/element.png')
        await er.resizeDocument('./src/element.png', 700)
        await tesseract.recognize('./src/element.png', { lang: 'vie-best', oem: 1, psm: 3 })
            .then(text => {
                elements['result'] = reconstruct(text.substring(0, text.length - 1))
                elements['notify'] = { type: 'success', message: 'Xử lý dữ liệu thành công' }
                fs.unlinkSync('./src/element.png')
                res.send(elements)
            })
            .catch(err => {
                console.log(err.message)
                res.send(err.message)
            })
    } catch (err) {
        elements['notify'] = { type: 'danger', message: 'Không thể xử lý được dữ liệu' }
        console.log(err)
        res.send(elements)
    }
}

exports.convert = async (req, res) => {
    try {
        var elements = {}
        var contentList = {}
        var numPage = 0
        var name = ''
        var parts = []
        var dataURLs = req.body.dataURL
        elements['images'] = []
        for (i in dataURLs) {
            if (dataURLs.length === 1) {
                await ImageDataURI.outputFile(dataURLs[i], './src/content.png')
            } else {
                if (i == 0) { name = 'content-0' }
                else if (i == dataURLs.length - 1) { name = 'content-9999' }
                else { name = 'content-' + i }
                await ImageDataURI.outputFile(dataURLs[i], './src/' + name + '.png')
            }
            await elements['images'].push(await resizebase64(dataURLs[i], 600, 840))//DataURL of document in image
            numPage++
        }

        // const parts = await er.findTop('./src/' + 0 + name)
        if (numPage === 1) {
            parts = await er.findTop('./src/content.png', false)
        } else {
            parts = (await er.findTop('./src/content-0.png', true)).concat(await er.findBot('./src/content-9999.png', true))
            for (var i = 1; i < dataURLs.length - 1; i++) {
                parts.push('content-' + i)
            }
        }
        // fs.unlinkSync('./src/' + name)

        elements['content'] = ''
        if (fs.existsSync('./src/stamp.png')) er.getStamp('./src/stamp.png')
        await Promise.all(parts.map(async (part) => {
            await tesseract.recognize('./src/' + part + '.png', {
                lang: (['org', 'tna', 'sns', 'id'].includes(part)) ? 'vie-best' : 'vie-fast',
                preserve_interword_spaces: (part.match(/content/)) ? 1 : 0,
                oem: 1,
                psm: (['sns', 'id', 'org', 'nabrand'].includes(part)) ? 11 : 3, //3 for normal, 7 for single line   
            })
                .then(text => {
                    if (part.match(/content/)) { contentList[part] = reconstruct(text.substring(0, text.length - 1)) }
                    else elements[part] = reconstruct(text.substring(0, text.length - 1))
                    fs.unlinkSync('./src/' + part + '.png')
                })
                .catch(err => {
                    console.log(err.message)
                    res.send(err.message)
                })
        }))

        //FIND THE ELEMENTS
        if (elements['nabrand'] && !elements['pnt']) elements['nabrand'].split("\n")[2] ? elements['pnt'] = elements['nabrand'].split("\n")[2] + ' ' : ''
        if (!elements['id']) {
            elements['id'] = elements['org'].split("\n")[elements['org'].split("\n").length - 2] + ' '
            elements['org'] = elements['org'].split("\n").slice(0, -2).join("\n")
        }
        if (elements['org']) {
            if (elements['org'].split("\n").length > 2) {
                elements['orgO'] = elements['org'].split('\n')[0]
                elements['orgP'] = elements['org'].split('\n').splice(1, 2).join(' ')
            } else {
                elements['orgP'] = elements['org'].split('\n')[0]
            }
        }
        elements['id'] ? elements['id'] = elements['id'].substring(3, elements['id'].length - 1) : ''
        if (elements['id'] && !elements['abstract']) elements['id'].split("\n")[1] ? elements['abstract'] = elements['id'].split("\n").slice(1).join(" ") + ' ' : ''
        elements['pnt'] ? elements['pnt'] = spellCheck(elements['pnt'], ['ngày', 'tháng', 'năm']) : ''
        elements['pnt'] ? elements['place'] = elements['pnt'].substring(0, elements['pnt'].indexOf(',')) : ''
        elements['pnt'] ? elements['day'] = Number(elements['pnt'].substring(elements['pnt'].indexOf('ngày') + 4, elements['pnt'].indexOf('tháng')).replace("l", "1").replace(/[^\d]/g, "")) : ''
        elements['pnt'] ? elements['month'] = Number(elements['pnt'].substring(elements['pnt'].indexOf('tháng') + 5, elements['pnt'].indexOf('năm')).replace("l", "1").replace(/[^\d]/g, "")) : ''
        elements['pnt'] ? elements['year'] = Number(elements['pnt'].substring(elements['pnt'].indexOf('năm') + 3, elements['pnt'].length - 1).replace("l", "1").replace(/[^\d]/g, "")) : ''
        elements['org'] ? elements['org'] = elements['org'].replace(/\n$/, "").split("\n").join("\n ") : ''
        elements['id'] ? elements['id'] = elements['id'].split("\n")[0].split(" ").join("") : ''
        elements['tna'] ? elements['type'] = elements['tna'].split('\n')[0] : ''
        elements['tna'] ? elements['abstract'] = elements['tna'].split("\n").slice(1, -1).join("\n") : ''
        elements['recv'] ? elements['recv'] = elements['recv'].split("\n").slice(1, -1).join("\n").split("~").join("-") : ''
        elements['stamp'] = fs.existsSync('./src/stamp.png') ? await ImageDataURI.encodeFromFile('./src/stamp.png') : ''
        elements['content'] = sortJoinDict(contentList)
        elements['content'] = rearrange(elements['content'])

        if (!elements['day'] || elements['day'] < 1 || elements['day'] > 31) elements['day'] = 1
        if (!elements['month'] || elements['month'] < 1 || elements['month'] > 12) elements['month'] = 1
        if (!elements['year'] || elements['year'] < 1945 || elements['year'] > 2100) elements['year'] = 1945

        if (elements['sns']) {
            var pos = elements['sns'].split("\n")
            elements['name'] = wordOnly(pos.slice(-2)[0])       //Cần chỉnh lại
            elements['position'] = pos[0] + (isUpperCase(pos[1]) && pos[1].length > 7 ? ',' + pos[1] : '') + (isUpperCase(pos[2]) && pos[2].length > 7 ? (',' + pos[2]) : '')
        } else { elements['name'] = ''; elements['position'] = '' }
        //Find best similarity
        if (elements['type']) elements['type'] = (stringSimilarity.findBestMatch(elements['type'], docTypes).bestMatch.rating > 0.6) ? stringSimilarity.findBestMatch(elements['type'], docTypes).bestMatch.target : elements['type']
        if (elements['place']) elements['place'] = (stringSimilarity.findBestMatch(elements['place'], docPlaces).bestMatch.rating > 0.2) ? stringSimilarity.findBestMatch(elements['place'], docPlaces).bestMatch.target : elements['place']
        if (elements['position']) elements['position'] = elements['position'].split(',').map(pos =>
            (stringSimilarity.findBestMatch(pos, docPositions).bestMatch.rating > 0.1) ? stringSimilarity.findBestMatch(pos, docPositions).bestMatch.target : pos
        ).join(', ')
        if (!elements['type']) elements['type'] = "CÔNG VĂN"

        //Set notification
        elements['notify'] = { type: 'success', message: 'Xử lý dữ liệu thành công' }
        if (fs.existsSync('./src/stamp.png')) fs.unlinkSync('./src/stamp.png')
        res.send(elements)
    } catch (err) {
        elements['notify'] = { type: 'danger', message: 'Không thể xử lý được dữ liệu' }
        console.log(err)
        res.send(elements)

        console.log(elements['day'],elements['month'],elements['year'])
    }
}




//FUNCTION
function reconstruct(text) { return replace(text.split("\r\n").join("\n").split("\n\n").join("\n")) }
function replace(text) {
    return text.split("Š").join("5").split("§").join("S").split("- _").join("-").split("-_").join("-").split("~").join("-").split("ø").join("g")
}
function rearrange(text) {
    var lines = text.split("\n")
    if (!isUpperCase(lines[0])) lines[0] = "\t" + lines[0]
    for (i in lines) {
        if ((lines[i].length < 60 || [':', '.', ';', ',', ')'].includes(lines[i][lines[i].length - 1])) || isUpperCase(lines[i]) || (lines[i + 1] ? (lines[i + 1][0] == "-") : false)) lines[i] = lines[i].concat("\n")
        else lines[i] = lines[i].concat(" ")
    }
    return lines.join("").split("\n").join("\n\t")
}
function spellCheck(text, list) {
    words = text.split(" ")
    for (w in words) {
        if (stringSimilarity.findBestMatch(words[w], list).bestMatch.rating > 0.05) words[w] = stringSimilarity.findBestMatch(words[w], list).bestMatch.target
    }
    return words.join(" ")
}
function isUpperCase(text) { if (text) return text === text.toUpperCase() }
function wordOnly(text) { return text.replace(/[^0-9a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '') }
function sortJoinDict(dict) {
    var content = ""
    var items = Object.keys(dict).map((key) => { return [key.replace(/[^\d]/g, ""), dict[key]] })
    items.sort((a, b) => { return a[0] - b[0] })
    for (i in items) content += items[i][1]
    return content
}


//LIST OF REGULAR WORDS
const docTypes = ['NGHỊ QUYẾT', 'QUYẾT ĐỊNH', 'CHỈ THỊ', 'QUY CHẾ', 'QUY ĐỊNH', 'THÔNG CÁO', 'THÔNG BÁO', 'HƯỚNG DẪN', 'CHƯƠNG TRÌNH', 'KẾ HOẠCH', 'PHƯƠNG ÁN', 'ĐỀ ÁN', 'DỰ ÁN',
    'BÁO CÁO', 'BIÊN BẢN', 'TỜ TRÌNH', 'HỢP ĐỒNG', 'CÔNG VĂN', 'CÔNG ĐIỆN', 'BẢN GHI NHỚ', 'BẢN CAM KẾT', 'BẢN THỎA THUẬN', 'GIẤY CHỨNG NHẬN', 'GIẤY ỦY QUYỀN', 'GIẤY MỜI',
    'GIẤY GIỚI THIỆU', 'GIẤY NGHỈ PHÉP', 'GIẤY ĐI ĐƯỜNG', 'GIẤY BIÊN NHẬN HỒ SƠ', 'PHIẾU GỬI', 'PHIẾU CHUYỂN', 'THƯ CÔNG']
const docPositions = ['', 'BỘ TRƯỞNG', 'CHỦ TỊCH', 'KT. CHỦ TỊCH', 'PHÓ CHỦ TỊCH', 'TM. HỘI ĐỒNG NHÂN DÂN', 'TM. ĐOÀN ĐẠI BIỂU QUỐC HỘI', 'BỘ TRƯỞNG', 'KT. BỘ TRƯỞNG', 'THỨ TRƯỞNG', 'CHÁNH VĂN PHÒNG',
    'HIỆU TRƯỞNG', 'KT. HIỆU TRƯỞNG', 'PHÓ HIỆU TRƯỞNG', 'CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ', 'PHÓ CHỦ TỊCH THƯỜNG TRỰC', 'GIÁM ĐỐC', 'PHÓ GIÁM ĐỐC', 'TM. HỘI ĐỒNG BẦU CỬ QUỐC GIA', 'TM. HỘI ĐỒNG THẨM PHÁN',
    'KT. CHÁNH ÁN', 'PHÓ CHÁNH ÁN', 'TM. HỘI ĐỒNG QUẢN TRỊ', 'TM. CHỦ TỊCH HỘI ĐỒNG QUẢN TRỊ', 'TRƯỞNG PHÒNG ĐÀO TẠO', 'TL. HIỆU TRƯỞNG', 'TM. HỘI ĐỒNG BẦU CỬ QUỐC GIA']
const docPlaces = ['Vĩnh Long', 'Đà Nẵng', 'Bình Thuận', 'Đồng Nai', 'Đồng Tháp', 'Quảng Bình', 'Kiên Giang', 'Long An', 'Khánh Hòa', 'Quảng Ninh', 'Phú Yên', 'Nghệ An', 'Hòa Bình', 'Trà Vinh', 'Thanh Hóa',
    'Hậu Giang', 'Bình Phước', 'Cà Mau', 'Bạc Liêu', 'Thừa Thiên - Huế', 'TP.HCM', 'TP. Hồ Chí Minh', 'Tiền Giang', 'Hà Nội', 'Bắc Giang', 'Đắk Nông', 'Điện Biên', 'Hà Giang', 'Quảng Nam', 'Quảng Ngãi', 'Hà Nam',
    'Lâm Đồng', 'Lào Cai', 'Bến Tre', 'Ninh Bình', 'Ninh Thuận', 'Bắc Kạn', 'Bình Định', 'Bình Dương', 'Bắc Ninh', 'Cao Bằng', 'Gia Lai', 'Hải Phòng', 'Hải Dương', 'Yên Bái', 'Sóc Trăng', 'Thái Bình', 'Hà Tĩnh',
    'Quảng Trị', 'Kon Tum', 'Nam Định', 'Sơn La', 'An Giang', 'Tây Ninh', 'Thái Nguyên', 'Cần Thơ', 'Lạng Sơn', 'Phú Thọ', 'Đắk Lắk', 'Vĩnh Phúc', 'Bà Rịa - Vũng Tàu', 'Tuyên Quang', 'Lai Châu', 'Hưng Yên']