const { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType, BorderStyle, TextRun, AlignmentType, } = require('docx')

function isUpperCase(str) {
    return str === str.toUpperCase();
}

// Create document
exports.generateDoc = async (req, res) => {
    const doc = new Document()
    var document = []
    var firstRow = []
    var naBrandSize = (req.body.orgP || req.body.orgO) ? 5400 : 9000

    // Create table for org name and national brand
    if (req.body.orgP) {
        var orgPs = req.body.orgP.split(/\n/)
        // .substring(0, req.body.title.length - 5)
        var orgCell = []
        if(req.body.orgO) {
            var orgOs = req.body.orgO.split(/\n/)
            for (x in orgOs) {
                if (orgOs[x]) orgCell.push(new Paragraph({ children: [new TextRun({ text: orgOs[x], size: '24', bold: false })], alignment: AlignmentType.CENTER }))
            }
        }
        for (x in orgPs) {
            if (orgPs[x]) orgCell.push(new Paragraph({ children: [new TextRun({ text: orgPs[x], size: '24', bold: true })], alignment: AlignmentType.CENTER }))
        }
        orgCell.push(new Paragraph({ children: [new TextRun({ text: "‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾", size: '12', bold: true })], alignment: AlignmentType.CENTER }))
        firstRow.push(
            new TableCell({
                children: orgCell,
                width: { size: 3600, type: WidthType.DXA, },
                borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
            })
        )
    }
    firstRow.push(
        new TableCell({
            children: [
                new Paragraph({ children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", size: '24', bold: true })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", size: '26', bold: true })], alignment: AlignmentType.CENTER }),
                new Paragraph({ children: [new TextRun({ text: "‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾", size: '12', bold: true })], alignment: AlignmentType.CENTER })
            ],
            width: { size: naBrandSize, type: WidthType.DXA, },
            borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
            columnSpan: 2
        })
    )
    // Date time and id
    var secondRow = []
    if (req.body.id) {
        var idCell = []
        idCell.push(new Paragraph({ children: [] }))
        idCell.push(new Paragraph({ children: [new TextRun({ text: "Số: " + req.body.id, size: '26' })], alignment: AlignmentType.CENTER }))
        if(req.body.type == "CÔNG VĂN") idCell.push(new Paragraph({ children: [new TextRun({ text: req.body.abstract, size: '24' })], alignment: AlignmentType.CENTER }))
        secondRow.push(
            new TableCell({
                children: idCell,
                width: { size: 3600, type: WidthType.DXA },
                borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
            })
        )
    } else secondRow.push(new TableCell({ children: [], width: { size: 3600, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } } }))
    secondRow.push(
        new TableCell({
            children: [
                new Paragraph({ children: [] }),
                new Paragraph({ children: [new TextRun({ text: req.body.place + ", ngày " + req.body.day + " tháng " + req.body.month + " năm " + req.body.year, size: '26', italics: true })], alignment: AlignmentType.CENTER })
            ],
            width: { size: 5400, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
        })
    )

    document.push(
        new Table({
            width: {
                size: 9000,
                type: WidthType.DXA
            },
            rows: [
                new TableRow({ children: firstRow }),
                new TableRow({ children: secondRow })
            ],
        })
    )

    //Create type and abstract
    document.push(new Paragraph({ children: [] }))
    if (req.body.type != "CÔNG VĂN") {
        document.push(new Paragraph({ children: [new TextRun({ text: req.body.type, size: '28', bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 70 } }))
        req.body.abstract ? document.push(new Paragraph({ children: [new TextRun({ text: req.body.abstract, size: '28', bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 70 } })) : ''
        document.push(new Paragraph({ children: [new TextRun({ text: "‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾", size: '12', bold: true })], alignment: AlignmentType.CENTER }))
        document.push(new Paragraph({ children: [] }))
    }

    //Create content
    var lines = req.body.content.split(/\n/)
    for (x in lines) {
        if (isUpperCase(lines[x])) document.push(new Paragraph({ children: [new TextRun({ text: lines[x], size: '26', bold: true })], spacing: { before: 120 }, alignment: AlignmentType.CENTER }))
        else document.push(new Paragraph({ children: [new TextRun({ text: lines[x], size: '26' })], spacing: { before: 100 }, alignment: AlignmentType.JUSTIFIED }))
    }

    //Create recv, name and stamp 
    var lastRow = []

    if (req.body.recv) {
        var recvCell = [new Paragraph({ children: [new TextRun({ text: "Nơi nhận", size: '24', bold: true, italics: true })] })]
        var recvs = req.body.recv.split(/\n/)
        for (x in recvs) {
            recvCell.push(new Paragraph({ children: [new TextRun({ text: recvs[x], size: '22' })] }))
        }

        lastRow.push(
            new TableCell({
                children: recvCell,
                width: { size: 4500, type: WidthType.DXA, },
                borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
            })
        )
    } else {
        lastRow.push(
            new TableCell({
                children: [],
                width: { size: 6000, type: WidthType.DXA, },
                borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
            })
        )
    }

    var snsCell = []
    if(req.body.position) {
        var poss = req.body.position.split(',')
        for (x in poss) {
            snsCell.push(new Paragraph({ children: [new TextRun({ text: poss[x].toUpperCase(), size: '26', bold: true })], alignment: AlignmentType.CENTER }))
        }
    }
    snsCell.push(new Paragraph({ children: [new TextRun({ text: req.body.name ? "(Đã ký)" : "", size: '26', bold: true, italics: true })], alignment: AlignmentType.CENTER }))
    // req.body.stamp ? snsCell.push(new Paragraph({ children: [Media.addImage(doc, Buffer.from(req.body.stamp.split(",")[1], 'base64'))], alignment: AlignmentType.CENTER})) : ''
    snsCell.push(new Paragraph({ children: [new TextRun({ text: "", size: '26' })], alignment: AlignmentType.CENTER }))
    snsCell.push(new Paragraph({ children: [new TextRun({ text: req.body.name ? req.body.name : '', size: '26', bold: true })], alignment: AlignmentType.CENTER }))

    lastRow.push(
        new TableCell({
            children: snsCell,
            width: { size: 3000, type: WidthType.DXA },
            borders: { top: { style: BorderStyle.NONE, size: 1 }, bottom: { style: BorderStyle.NONE, size: 1 }, left: { style: BorderStyle.NONE, size: 1 }, right: { style: BorderStyle.NONE, size: 1 } },
        })
    )

    document.push(
        new Paragraph({ children: [] }),
        new Table({
            width: {
                size: 9000,
                type: WidthType.DXA
            },
            rows: [
                new TableRow({
                    children: lastRow
                }),
            ],
        }),
    )

    //Render process
    doc.addSection({
        children: document
    })
    res.send(await Packer.toBase64String(doc))
}