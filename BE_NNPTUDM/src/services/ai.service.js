const { Buffer } = require("node:buffer");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const { gateway, generateText } = require("ai");

const randomString = require("@/utils/randomString");

class AIService {
  constructor() {
    // Setup...
  }

  async generateText(model, prompt, output, tools) {
    const { text } = await generateText({
      model,
      prompt,
      output,
      tools,
    });
    return text;
  }

  async webSearch(prompt, output) {
    return this.generateText("openai/gpt-5.2", prompt, output, {
      perplexity_search: gateway.tools.perplexitySearch({
        country: "VN",
        searchLanguageFilter: ["vi", "en"],
        searchRecencyFilter: "year",
      }),
    });
  }

  stream() {
    // ...
  }

  async generateImage(prompt, filePath = "ai-generated", model = "google/gemini-3-pro-image") {
    const result = await generateText({
      model,
      prompt,
    });

    if (!result.files.length) {
      throw new Error("No image.");
    }

    const { base64Data, mediaType } = result.files[0];
    const imageBuffer = Buffer.from(base64Data, "base64");
    const imageName = `${randomString(8)}.${mediaType.split("/").pop()}`;
    const dirPath = path.join(__dirname, "..", "..", "public", "images", filePath);
    const imagePath = path.join(dirPath, imageName);

    await this.createFolderIfNotExists(dirPath);
    await sharp(imageBuffer)
      .resize(400)
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
      })
      .toFile(imagePath);

    return path.join("images", filePath, imageName);
  }

  async createFolderIfNotExists(folderPath) {
    try {
      await fs.mkdir(folderPath, { recursive: true });
    } catch (err) {
      console.error(`Error creating directory: ${err.message}`);
    }
  }
}

module.exports = new AIService();
