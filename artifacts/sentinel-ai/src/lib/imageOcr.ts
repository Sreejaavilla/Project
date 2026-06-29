import Tesseract from 'tesseract.js';

export async function extractTextFromImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress);
          }
        }
      }
    );
    return result.data.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text from image");
  }
}
