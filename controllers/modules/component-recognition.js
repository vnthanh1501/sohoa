const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas')
const { JSDOM } = require('jsdom')
const { writeFileSync } = require('fs')

exports.findTop = async (pathImage, isMultipage) => {
  let image = cv.imread(await loadImage(pathImage))
  cv.resize(image, image, new cv.Size(1500, image.rows * 1500 / image.cols), interpolation = cv.INTER_AREA)
  let origin = image, tmp = new cv.Mat()
  image = image.roi(new cv.Rect(0, 0, image.cols, image.rows / 4))
  let canvas = createCanvas(image.cols, image.rows)

  cv.cvtColor(image, tmp, cv.COLOR_BGR2GRAY)
  cv.threshold(tmp, tmp, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)[1]

  let kernel = cv.getStructuringElement(cv.MORPH_CROSS, new cv.Size(12, 9)) //Slide box (increse width to get group more box, increase height to get more lines)
  cv.dilate(tmp, tmp, kernel, new cv.Point(0, 0), 3, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue()) //The number of iteration inversely propotional to accuracy

  let contours = new cv.MatVector(), hierarchy = new cv.Mat()
  cv.findContours(tmp, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

  let type = '', yContent = 0, idHeight = 0, orgHeight = 0
  found = []
  for (var i = contours.size() - 1; i >= 0; i--) {
    let rect = cv.boundingRect(contours.get(i))
    if (rect.height > 35 && rect.width > 150) {
      if ((rect.x + rect.width) < image.cols / 1.5) { //Left side
        if (!found.includes('org')) { type = "org"; orgHeight = rect.height; yContent = rect.y + rect.height > yContent ? rect.y + rect.height : yContent }
        else if ((found.includes('org') || found.includes('pnt')) && (!found.includes('id') && !found.includes('tna')) && rect.width > 180) { type = "id"; idHeight = rect.height; yContent = rect.y + rect.height > yContent ? rect.y + rect.height : yContent }
        else if (!found.includes('abstract') && rect.width > 200) { type = "abstract"; yContent = rect.y + rect.height > yContent ? rect.y + rect.height : yContent }
      } else if (rect.x > image.cols / 4 && image.cols - (rect.x + rect.width) < 1500) {  //Right side
        if (rect.height > 90) type = "nabrand" //Tìm chơi chứ không xài
        else if (!found.includes('pnt')) { type = "pnt"; yContent = rect.y + rect.height > yContent ? rect.y + rect.height : yContent }
      }
      if (Math.abs(2 * rect.x + rect.width - image.cols) < image.cols / 12 && image.cols - rect.width > 100 && !found.includes("tna") && (found.includes("nabrand") || found.includes("org")) && idHeight < 120 && orgHeight < 230) {
        type = "tna"
        yContent = rect.y + rect.height > yContent ? rect.y + rect.height : yContent
      }

      if (type) {
        if (!found.includes(type)) found.push(type)
        cv.imshow(canvas, image.roi(new cv.Rect(rect.x + 25, rect.y + 10, rect.width - 25, rect.height - 10)))
        writeFileSync('./src/' + type + '.png', canvas.toBuffer())
      }
      type = ""
    }
  }

  cv.imshow(canvas, origin.roi(new cv.Rect(0, yContent, origin.cols, origin.rows - yContent)))
  if (!isMultipage) {
    await writeFileSync('./src/content.png', canvas.toBuffer())
    found.push('content')
    found = found.concat(await findBot('./src/content.png', false))
  } else {
    await writeFileSync('./src/content-0.png', canvas.toBuffer())
    found.push('content-0')
    // found = found.concat(await findBot('./src/content.png'))
  }
  origin.delete(); image.delete(); tmp.delete(); kernel.delete()
  return found
}
exports.findBot = async (pathImage, isMultipage) => findBot(pathImage, isMultipage)
findBot = async (pathImage, isMultipage) => {
  let image = cv.imread(await loadImage(pathImage))
  cv.resize(image, image, new cv.Size(1500, image.rows * 1500 / image.cols), interpolation = cv.INTER_AREA)
  let canvas = createCanvas(image.cols, image.rows)

  let tmp = new cv.Mat()
  cv.cvtColor(image, tmp, cv.COLOR_BGR2GRAY)
  cv.threshold(tmp, tmp, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)[1]

  let kernel = cv.getStructuringElement(cv.MORPH_CROSS, new cv.Size(15, 9)) //Slide box (increse width to get group more box, increase height to get more lines)
  cv.dilate(tmp, tmp, kernel, new cv.Point(0, 0), 2, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue()) //The number of iteration inversely propotional to accuracy

  let contours = new cv.MatVector(), hierarchy = new cv.Mat()
  cv.findContours(tmp, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

  var i = 0
  found = []
  var type = ''
  let yContent = image.rows
  while (contours.get(i)) {
    let rect = cv.boundingRect(contours.get(i++))
    if (rect.height > 50 && rect.width > 50) {
      if (rect.x < image.cols / 3 && rect.width < image.cols * 2 / 3) { //Left side
        if (rect.height > 100 && !found.includes("recv") && rect.x + rect.width < image.cols * 4 / 5) type = "recv"
      }
      if (rect.x > image.cols / 3 && !found.includes("sns")) {  //Right side
        if (rect.height > 150 && rect.height < 500) type = "sns"
      }

      if (type) {
        if (!found.includes('recv') || !found.includes('sns')) {
          found.push(type)
          yContent = rect.y < yContent ? rect.y : yContent
        }
        cv.imshow(canvas, image.roi(new cv.Rect(rect.x + 25, rect.y + 10, rect.width - 25, (type === 'sns' && rect.y + rect.height + 75 < image.rows) ? rect.height + 50 : rect.height - 10)))
        await writeFileSync('./src/' + type + '.png', canvas.toBuffer())
      }
      type = ""
    }
  }
  if (found.includes('sns')) await getName('./src/sns.png')
  cv.imshow(canvas, image.roi(new cv.Rect(0, 0, image.cols, yContent)))
  if (!isMultipage) await writeFileSync('./src/content.png', canvas.toBuffer())
  else {
    writeFileSync('./src/content-9999.png', canvas.toBuffer())
    found.push('content-9999')
  }

  image.delete(); tmp.delete(); contours.delete(); hierarchy.delete(); kernel.delete()
  return found
}

getName = async (pathImage) => {
  let image = cv.imread(await loadImage(pathImage))
  cv.resize(image, image, new cv.Size(1500, image.rows * 1500 / image.cols), interpolation = cv.INTER_AREA)
  let canvas = createCanvas(image.cols, image.rows)

  let gray = new cv.Mat()
  let tmp = new cv.Mat()
  let stamp = new cv.Mat()
  cv.cvtColor(image, gray, cv.COLOR_BGR2GRAY)

  let low = new cv.Mat(image.rows, image.cols, image.type(), [0, 0, 0, 0]), high = new cv.Mat(image.rows, image.cols, image.type(), [170, 255, 180, 255])
  cv.inRange(image, low, high, gray) //TEST FILTER COLOR
  cv.bitwise_not(gray, gray)

  //FILTER
  cv.resize(image, stamp, new cv.Size(500, image.rows * 500 / image.cols), interpolation = cv.INTER_AREA)
  for (var i = 0; i < stamp.rows; i++) {
    for (var j = 0; j < stamp.cols; j++) {
      var pixel = stamp.ucharPtr(i, j)
      if (pixel[0] < 150 || pixel[2] > 160) { stamp.ucharPtr(i, j)[0] = 255; stamp.ucharPtr(i, j)[1] = 255; stamp.ucharPtr(i, j)[2] = 255; stamp.ucharPtr(i, j)[3] = 255 }
      else { stamp.ucharPtr(i, j)[0] = 225; stamp.ucharPtr(i, j)[1] = 70; stamp.ucharPtr(i, j)[2] = 70; stamp.ucharPtr(i, j)[3] = 255 }
    }
  }

  cv.imshow(canvas, gray)
  writeFileSync('./src/sns.png', canvas.toBuffer())
  cv.imshow(canvas, stamp)
  await writeFileSync('./src/stamp.png', canvas.toBuffer())
  image.delete(); low.delete(); high.delete(); gray.delete(); tmp.delete(), stamp.delete()
}

exports.getStamp = async (pathImage) => {
  const src = await loadImage(pathImage)
  let image = cv.imread(src)
  let stamp = new cv.Mat()
  let tmp = cv.imread(src)
  let canvas = createCanvas(image.cols, image.rows)

  let mask = cv.Mat.zeros(image.rows, image.cols, cv.CV_8U);
  let circles = new cv.Mat(), minR = 70

  cv.cvtColor(tmp, tmp, cv.COLOR_RGBA2GRAY, 0);
  cv.GaussianBlur(tmp, tmp, new cv.Size(21, 21), 0)

  while (circles.cols == 0 && minR > 0) {
    cv.HoughCircles(tmp, circles, cv.HOUGH_GRADIENT, 1, 1, 1, minR, 70, 200)
    minR = minR - 10
  }

  let radius = 0, x = 0, y = 0, center = new cv.Point()
  for (let i = 0; i < circles.cols; ++i) {
    if (radius < circles.data32F[i * 3 + 2]) {
      x = circles.data32F[i * 3];
      y = circles.data32F[i * 3 + 1]
      radius = circles.data32F[i * 3 + 2] + 5
      center = new cv.Point(x, y);
    }
  }

  cv.circle(mask, center, radius, new cv.Scalar(255, 255, 255, 255), -1, 8, 0)
  cv.threshold(mask, mask, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)[1]
  cv.bitwise_not(mask, mask)
  cv.bitwise_and(image, image, stamp, mask)

  // for (var i = 0; i < stamp.rows; i++) {
  //   for (var j = 0; j < stamp.cols; j++) {
  //     var pixel = stamp.ucharPtr(i, j)
  //     if (pixel[0] < 170 || pixel[2] > 150) { stamp.ucharPtr(i, j)[0] = 0; stamp.ucharPtr(i, j)[1] = 0; stamp.ucharPtr(i, j)[2] = 0; stamp.ucharPtr(i, j)[3] = 0 }
  //   }
  // }

  cv.imshow(canvas, stamp.roi(new cv.Rect((x - radius > 0) ? (x - radius) : 0, (y - radius) > 0 ? (y - radius) : 0, (x + radius) < stamp.cols ? 2 * radius : stamp.cols - (x - radius), (y + radius) < stamp.rows ? 2 * radius : stamp.rows - (y - radius))))
  writeFileSync('./src/stamp.png', canvas.toBuffer())
  mask.delete(); circles.delete(); image.delete(); stamp.delete(); tmp.delete()

}


exports.resizeDocument = async (pathImage, size) => {
  let image = cv.imread(await loadImage(pathImage))
  cv.resize(image, image, new cv.Size(size, image.rows * size / image.cols), interpolation = cv.INTER_AREA)
  let canvas = createCanvas(image.cols, image.rows)

  cv.imshow(canvas, image)
  writeFileSync(pathImage, canvas.toBuffer())
  image.delete()
}







loadOpenCV = () => { return new Promise(resolve => { global.Module = { onRuntimeInitialized: resolve }; global.cv = require('./opencv') }) }
installDOM = () => { const dom = new JSDOM(); global.document = dom.window.document; global.Image = Image; global.HTMLCanvasElement = Canvas; global.ImageData = ImageData; global.HTMLImageElement = Image }
(async () => { installDOM(); await loadOpenCV() })()
