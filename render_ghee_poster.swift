import Cocoa
import CoreGraphics
import CoreText

let width: CGFloat = 800
let height: CGFloat = 1150

let colorSpace = CGColorSpaceCreateDeviceRGB()
guard let context = CGContext(data: nil,
                              width: Int(width),
                              height: Int(height),
                              bitsPerComponent: 8,
                              bytesPerRow: Int(width) * 4,
                              space: colorSpace,
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    fatalError("Could not create CGContext")
}

// 1. Draw rich amber/gold luxury gradient background
let gradientColors = [
    CGColor(red: 0.14, green: 0.09, blue: 0.02, alpha: 1.0), // Deep warm brown top
    CGColor(red: 0.42, green: 0.28, blue: 0.04, alpha: 1.0), // Golden bronze
    CGColor(red: 0.70, green: 0.48, blue: 0.08, alpha: 1.0), // Warm glowing gold
    CGColor(red: 0.42, green: 0.28, blue: 0.04, alpha: 1.0), // Deep gold
    CGColor(red: 0.15, green: 0.09, blue: 0.02, alpha: 1.0)  // Base amber
] as CFArray

let locations: [CGFloat] = [0.0, 0.22, 0.55, 0.88, 1.0]
if let gradient = CGGradient(colorsSpace: colorSpace, colors: gradientColors, locations: locations) {
    context.drawLinearGradient(gradient,
                               start: CGPoint(x: width / 2, y: height),
                               end: CGPoint(x: width / 2, y: 0),
                               options: [])
}

// Helper to draw centered text with flipped coordinates (Cocoa is bottom-left origin)
func drawText(_ text: String,
              fontName: String,
              fontSize: CGFloat,
              color: NSColor,
              yFromTop: CGFloat,
              letterSpacing: CGFloat = 0,
              shadow: Bool = true) {
    let font = NSFont(name: fontName, size: fontSize) ?? NSFont.systemFont(ofSize: fontSize, weight: .bold)
    
    let paragraphStyle = NSMutableParagraphStyle()
    paragraphStyle.alignment = .center
    
    var attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraphStyle,
        .kern: letterSpacing
    ]
    
    if shadow {
        let textShadow = NSShadow()
        textShadow.shadowColor = NSColor.black.withAlphaComponent(0.65)
        textShadow.shadowOffset = NSSize(width: 1, height: -2)
        textShadow.shadowBlurRadius = 4
        attrs[.shadow] = textShadow
    }
    
    let attrString = NSAttributedString(string: text, attributes: attrs)
    let textSize = attrString.size()
    
    let x = (width - textSize.width) / 2
    let y = height - yFromTop - textSize.height
    
    let rect = CGRect(x: x, y: y, width: textSize.width, height: textSize.height)
    
    let framesetter = CTFramesetterCreateWithAttributedString(attrString)
    let path = CGPath(rect: rect, transform: nil)
    let frame = CTFramesetterCreateFrame(framesetter, CFRangeMake(0, attrString.length), path, nil)
    CTFrameDraw(frame, context)
}

// 2. Draw Pramila Store Logo at Top Center
let logoPath = "/Users/anilmaharjan/Desktop/website/jacksean89k-max.github.io/images/logo.png"
if let logoImage = NSImage(contentsOfFile: logoPath),
   let logoCG = logoImage.cgImage(forProposedRect: nil, context: nil, hints: nil) {
    
    let badgeSize: CGFloat = 110
    let badgeX: CGFloat = (width - badgeSize) / 2
    let badgeY: CGFloat = height - 25 - badgeSize
    
    let badgeRect = CGRect(x: badgeX, y: badgeY, width: badgeSize, height: badgeSize)
    let badgePath = CGPath(ellipseIn: badgeRect, transform: nil)
    
    context.saveGState()
    context.setShadow(offset: CGSize(width: 0, height: -3), blur: 8, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.4))
    context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1.0))
    context.addPath(badgePath)
    context.fillPath()
    
    context.setStrokeColor(CGColor(red: 0.92, green: 0.70, blue: 0.15, alpha: 1.0))
    context.setLineWidth(3.5)
    context.addPath(badgePath)
    context.strokePath()
    
    // Draw Logo inside badge
    let logoInnerSize: CGFloat = 86
    let logoX = badgeX + (badgeSize - logoInnerSize) / 2
    let logoY = badgeY + (badgeSize - logoInnerSize) / 2
    context.draw(logoCG, in: CGRect(x: logoX, y: logoY, width: logoInnerSize, height: logoInnerSize))
    context.restoreGState()
}

// 3. Draw Typography
// "COW MILK GHEE"
drawText("COW MILK GHEE",
         fontName: "Georgia-Bold",
         fontSize: 34,
         color: NSColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 1.0),
         yFromTop: 148,
         letterSpacing: 2.0)

// "गाइको शुद्ध लोकल घ्यु"
drawText("गाइको शुद्ध लोकल घ्यु",
         fontName: "DevanagariSangamMN-Bold",
         fontSize: 45,
         color: NSColor(red: 1.0, green: 0.94, blue: 0.65, alpha: 1.0),
         yFromTop: 195,
         letterSpacing: 1.0)

// "NATURAL AND LOCAL"
drawText("NATURAL AND LOCAL",
         fontName: "HelveticaNeue-Bold",
         fontSize: 18,
         color: NSColor(red: 1.0, green: 0.96, blue: 0.86, alpha: 0.95),
         yFromTop: 260,
         letterSpacing: 2.5)

// "100% PURE AND ORIGINAL"
drawText("100% PURE AND ORIGINAL",
         fontName: "HelveticaNeue-Bold",
         fontSize: 15,
         color: NSColor(red: 0.96, green: 0.88, blue: 0.65, alpha: 0.90),
         yFromTop: 290,
         letterSpacing: 1.5)

// 4. Center White Card for the Jar
let cardW: CGFloat = 490
let cardH: CGFloat = 630
let cardX: CGFloat = (width - cardW) / 2
let cardY: CGFloat = height - 335 - cardH // 185 from bottom

let cardRect = CGRect(x: cardX, y: cardY, width: cardW, height: cardH)
let cardPath = CGPath(roundedRect: cardRect, cornerWidth: 22, cornerHeight: 22, transform: nil)

context.saveGState()
context.setShadow(offset: CGSize(width: 0, height: -6), blur: 18, color: CGColor(red: 0, green: 0, blue: 0, alpha: 0.45))
context.setFillColor(CGColor(red: 0.99, green: 0.99, blue: 0.99, alpha: 0.98))
context.addPath(cardPath)
context.fillPath()

// Card Gold Border
context.setStrokeColor(CGColor(red: 0.92, green: 0.75, blue: 0.20, alpha: 0.95))
context.setLineWidth(3.0)
context.addPath(cardPath)
context.strokePath()
context.restoreGState()

// 5. Draw Clean Jar Image with soft ground shadow
let cleanJarPath = "/Users/anilmaharjan/Desktop/website/jacksean89k-max.github.io/images/jar_clean_alpha.png"
if let jarImageSource = NSImage(contentsOfFile: cleanJarPath),
   let jarCGImage = jarImageSource.cgImage(forProposedRect: nil, context: nil, hints: nil) {
    
    let destW: CGFloat = 370
    let destH: CGFloat = 540
    let destX: CGFloat = (width - destW) / 2
    let destY: CGFloat = cardY + 45
    
    // Draw subtle ground contact shadow under jar
    context.saveGState()
    let shadowRect = CGRect(x: destX + 30, y: destY - 12, width: destW - 60, height: 32)
    let shadowPath = CGPath(ellipseIn: shadowRect, transform: nil)
    context.setFillColor(CGColor(red: 0.5, green: 0.4, blue: 0.1, alpha: 0.25))
    context.addPath(shadowPath)
    context.fillPath()
    context.restoreGState()
    
    // Draw Jar
    context.saveGState()
    context.setShadow(offset: CGSize(width: 0, height: -4), blur: 12, color: CGColor(red: 0.2, green: 0.15, blue: 0.05, alpha: 0.25))
    context.draw(jarCGImage, in: CGRect(x: destX, y: destY, width: destW, height: destH))
    context.restoreGState()
}

// 6. Bottom Separator Line and Store Address
context.saveGState()
context.setStrokeColor(CGColor(red: 0.92, green: 0.78, blue: 0.30, alpha: 0.85))
context.setLineWidth(2.0)
context.move(to: CGPoint(x: 60, y: 100))
context.addLine(to: CGPoint(x: width - 60, y: 100))
context.strokePath()
context.restoreGState()

drawText("PRAMILA STORE  •  MAHARJAN CHOWK, IMADOL  •  100% PURE NEPALI GHEE",
         fontName: "HelveticaNeue-Bold",
         fontSize: 14.5,
         color: NSColor(red: 1.0, green: 0.95, blue: 0.80, alpha: 0.95),
         yFromTop: 1075,
         letterSpacing: 1.0,
         shadow: false)

// 7. Save result
if let outputCGImage = context.makeImage() {
    let rep = NSBitmapImageRep(cgImage: outputCGImage)
    if let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.96]) {
        let outputPath = "/Users/anilmaharjan/Desktop/website/jacksean89k-max.github.io/images/prod-local-cow-ghee.jpg"
        try? data.write(to: URL(fileURLWithPath: outputPath))
        print("Successfully generated Cow Ghee poster at:", outputPath)
    }
}
