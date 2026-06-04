const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateListingContent(propertyData) {
  const { address, bedrooms, bathrooms, price, features } = propertyData;
  
  const prompt = `
    Act as a professional real estate marketing expert. 
    Generate marketing content for the following property:
    Address: ${address}
    Bedrooms: ${bedrooms}
    Bathrooms: ${bathrooms}
    Price: ${price}
    Features: ${features}

    Provide the response in the following JSON format:
    {
      "caption": "A 2-3 sentence Instagram caption with emojis and hashtags.",
      "storyScript": "A 60-second Instagram story script with short bullet points and a call to action.",
      "newsletterIntro": "A ~100-word warm and professional email newsletter intro."
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // or "gpt-3.5-turbo"
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating content:', error);
    // Return a fallback or throw depending on desired error handling
    return {
      caption: "Check out this amazing new listing! 🏠✨ #RealEstate #DreamHome",
      storyScript: "Quick tour of this beautiful property! Swipe up for details. 📲",
      newsletterIntro: "We have an exciting new listing to share with you. This property offers everything you've been looking for."
    };
  }
}

module.exports = {
  generateListingContent
};
