import fs from 'fs';

import {
  CustomFontEmbedder,
  PDFContext,
  PDFDict,
  PDFHexString,
  PDFRef,
} from 'src/index';

const ubuntuFont = fs.readFileSync('./assets/fonts/ubuntu/Ubuntu-R.ttf');

describe(`CustomFontEmbedder`, () => {
  it(`can be constructed with CustomFontEmbedder.for(...)`, () => {
    const embedder = CustomFontEmbedder.for(ubuntuFont);
    expect(embedder).toBeInstanceOf(CustomFontEmbedder);
  });

  it(`exposes the font's name`, () => {
    const embedder = CustomFontEmbedder.for(new Uint8Array(ubuntuFont));
    expect(embedder.fontName).toBe('Ubuntu');
  });

  it(`can embed font dictionaries into PDFContexts without a predefined ref`, async () => {
    const context = PDFContext.create();
    const embedder = CustomFontEmbedder.for(new Uint8Array(ubuntuFont));

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context);
    expect(context.enumerateIndirectObjects().length).toBe(5);
    expect(context.lookup(ref)).toBeInstanceOf(PDFDict);
  });

  it(`can embed font dictionaries into PDFContexts with a predefined ref`, async () => {
    const context = PDFContext.create();
    const predefinedRef = PDFRef.of(9999);
    const embedder = CustomFontEmbedder.for(new Uint8Array(ubuntuFont));

    expect(context.enumerateIndirectObjects().length).toBe(0);
    const ref = await embedder.embedIntoContext(context, predefinedRef);
    expect(context.enumerateIndirectObjects().length).toBe(5);
    expect(context.lookup(predefinedRef)).toBeInstanceOf(PDFDict);
    expect(ref).toBe(predefinedRef);
  });

  it(`can encode text strings into PDFHexString objects`, () => {
    const text = 'Stuff and thingz!';
    const hexCodes =
      '00360057005801AA000300440051004700030057004B004C0051004A005D0004';
    const embedder = CustomFontEmbedder.for(ubuntuFont);

    expect(embedder.encodeText(text)).toBeInstanceOf(PDFHexString);
    expect(String(embedder.encodeText(text))).toBe(
      String(PDFHexString.of(hexCodes)),
    );
  });

  it(`can measure the width of text strings at the given font size`, () => {
    const text = 'Stuff and thingz!';
    const embedder = CustomFontEmbedder.for(ubuntuFont);
    expect(embedder.widthOfTextAtSize(text, 12)).toBe(90.672);
    expect(embedder.widthOfTextAtSize(text, 24)).toBe(181.344);
  });

  it(`can measure the height of the font at the given size`, () => {
    const embedder = CustomFontEmbedder.for(ubuntuFont);
    expect(embedder.heightOfFontAtSize(12)).toBeCloseTo(13.452);
    expect(embedder.heightOfFontAtSize(24)).toBeCloseTo(26.904);
  });

  it(`can measure the size of the font at a given height`, () => {
    const embedder = CustomFontEmbedder.for(ubuntuFont);
    expect(embedder.sizeOfFontAtHeight(12)).toBeCloseTo(10.705);
    expect(embedder.sizeOfFontAtHeight(24)).toBeCloseTo(21.409);
  });
});
