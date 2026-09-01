import Cocoa
import CoreGraphics
import CoreText

let width: CGFloat = 800
let height: CGFloat = 1100

let colorSpace = CGColorSpaceCreateDeviceRGB()
let context = CGContext(data: nil, width: Int(width), height: Int(height), bitsPerComponent: 8, bytesPerRow: Int(width)*4, space: colorSpace, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!

// Fill black/gold
context.setFillColor(CGColor(red: 0.18, green: 0.12, blue: 0.02, alpha: 1.0))
context.fill(CGRect(x: 0, y: 0, width: width, height: height))

func drawTextCocoa(_ text: String, fontName: String, fontSize: CGFloat, color: NSColor, yFromBottom: CGFloat) {
    let font = NSFont(name: fontName, size: fontSize) ?? NSFont.systemFont(ofSize: fontSize, weight: .bold)
    let paragraphStyle = NSMutableParagraphStyle()
    paragraphStyle.alignment = .center
    
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .paragraphStyle: paragraphStyle
    ]
    let attrStr = NSAttributedString(string: text, attributes: attrs)
    let size = attrStr.size()
    let rect = CGRect(x: (width - size.width) / 2, y: yFromBottom, width: size.width, height: size.height)
    
    let framesetter = CTFramesetterCreateWithAttributedString(attrStr)
    let path = CGPath(rect: rect, transform: nil)
    let frame = CTFramesetterCreateFrame(framesetter, CFRangeMake(0, attrStr.length), path, nil)
    CTFrameDraw(frame, context)
}

drawTextCocoa("COW MILK GHEE", fontName: "Georgia-Bold", fontSize: 36, color: .white, yFromBottom: 880)
drawTextCocoa("गाइको शुद्ध लोकल घ्यु", fontName: "DevanagariSangamMN-Bold", fontSize: 46, color: NSColor(red: 1.0, green: 0.94, blue: 0.65, alpha: 1.0), yFromBottom: 815)
drawTextCocoa("NATURAL AND LOCAL", fontName: "HelveticaNeue-Bold", fontSize: 20, color: .white, yFromBottom: 765)
drawTextCocoa("100% PURE AND ORIGINAL", fontName: "HelveticaNeue-Bold", fontSize: 16, color: NSColor(red: 0.95, green: 0.88, blue: 0.65, alpha: 0.90), yFromBottom: 730)

let outputCG = context.makeImage()!
let rep = NSBitmapImageRep(cgImage: outputCG)
let data = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.95])!
try! data.write(to: URL(fileURLWithPath: "images/test_text.jpg"))
print("Saved test_text.jpg")
