/**
 * BMP Encoder
 * Simple encoder for 24-bit BMP files
 */

/**
 * Encode RGB data to BMP buffer
 * @param {Uint8Array} rgbData - Input data [r, g, b, r, g, b, ...]
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Buffer} - BMP file buffer
 */
export function encodeBMP(rgbData, width, height) {
    // BMP lines are padded to 4-byte boundaries
    const paddingSize = (4 - ((width * 3) % 4)) % 4;
    const rowSize = (width * 3) + paddingSize;
    const fileSize = 54 + (rowSize * height);

    const buffer = Buffer.alloc(fileSize);

    // Bitmap File Header
    buffer.write('BM', 0);              // Signature
    buffer.writeUInt32LE(fileSize, 2);  // File size
    buffer.writeUInt32LE(0, 6);         // Reserved
    buffer.writeUInt32LE(54, 10);       // Data offset

    // DIB Header (BITMAPINFOHEADER)
    buffer.writeUInt32LE(40, 14);       // Header size
    buffer.writeInt32LE(width, 18);     // Width
    buffer.writeInt32LE(-height, 22);   // Height (negative = top-to-bottom)
    buffer.writeUInt16LE(1, 26);        // Planes
    buffer.writeUInt16LE(24, 28);       // Bit count (24-bit)
    buffer.writeUInt32LE(0, 30);        // Compression (BI_RGB)
    buffer.writeUInt32LE(0, 34);        // Image size (can be 0 for BI_RGB)
    buffer.writeInt32LE(0, 38);         // X pixels/meter
    buffer.writeInt32LE(0, 42);         // Y pixels/meter
    buffer.writeUInt32LE(0, 46);        // Colors used
    buffer.writeUInt32LE(0, 50);        // Colors important

    // Pixel Data
    // BMP is BGR, not RGB. And usually bottom-up, but we used negative height for top-down.
    // Input rgbData is expected to be top-down RGB.

    let offset = 54;
    let dataIdx = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const r = rgbData[dataIdx++];
            const g = rgbData[dataIdx++];
            const b = rgbData[dataIdx++];

            // Write BGR
            buffer[offset++] = b;
            buffer[offset++] = g;
            buffer[offset++] = r;
        }
        // Write padding
        for (let p = 0; p < paddingSize; p++) {
            buffer[offset++] = 0;
        }
    }

    return buffer;
}
