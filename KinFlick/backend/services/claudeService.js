const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.baseUrl = 'https://api.anthropic.com/v1/messages';
  }

  /**
   * Generate diary content from images using Claude Vision
   * @param {Array} photos - Array of photo objects with path property
   * @return {Promise<string>} Generated diary content
   */
  async generateDiaryContent(photos) {
    try {
      // Check if API key is set
      if (!this.apiKey || this.apiKey === 'your_claude_api_key_here') {
        console.error('CLAUDE_API_KEY is not set or is using the default value');
        throw new Error('Claude API key is not configured properly');
      }
      
      console.log('Claude API Key available:', !!this.apiKey);
      console.log(`Processing ${photos.length} photos for diary generation`);

      // Prepare message content
      const content = [];

      // Add text part
      content.push({
        type: 'text',
        text: 'For each photo, generate: 1) A witty punchline (just one short sentence) and 2) A funny, creative mini-story (2-3 sentences) related to what\'s happening in the image, don\'t just describe what\'s in the photo. Make it humorous and entertaining. Format the response as a JSON array where each object has "punchline" and "description" fields. Example: [{"punchline": "Coffee: because adulting is hard", "description": "Jim\'s coffee developed sentience and was now judging his life choices. \"Another all-nighter?\" it seemed to ask, as Jim frantically typed his overdue report."}]'
      });

      // Add image parts
      for (const photo of photos) {
        try {
          console.log(`Reading photo from path: ${photo.path}`);
          // Check if file exists before reading
          if (!fs.existsSync(photo.path)) {
            console.error(`Photo file does not exist: ${photo.path}`);
            throw new Error(`Photo file not found: ${photo.path}`);
          }
          
          const imageBuffer = fs.readFileSync(photo.path);
          const base64Image = imageBuffer.toString('base64');
          
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: photo.path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
              data: base64Image
            }
          });
          console.log(`Successfully processed photo: ${photo._id}`);
        } catch (photoError) {
          console.error(`Error processing photo ${photo._id}:`, photoError);
          throw new Error(`Could not read photo file: ${photo.path}`);
        }
      }

      console.log('Making request to Claude API');
      // Make API request to Claude
      const requestBody = {
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content
          }
        ]
      };
      
      console.log('Request URL:', this.baseUrl);
      console.log('Request body structure:', JSON.stringify({
        model: requestBody.model,
        max_tokens: requestBody.max_tokens,
        messages: [{ role: 'user', content: [`${content.length} items (text + ${photos.length} images)`] }]
      }));
      
      const response = await axios.post(
        this.baseUrl,
        requestBody,
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      console.log('Claude API responded successfully with status:', response.status);
      
      if (!response.data || !response.data.content || !response.data.content[0]) {
        console.error('Unexpected API response structure:', JSON.stringify(response.data));
        throw new Error('Unexpected response format from Claude API');
      }
      
      const responseText = response.data.content[0].text;
      
      try {
        // Parse the JSON response
        const panelData = JSON.parse(responseText);
        if (!Array.isArray(panelData)) {
          console.error('Response is not a JSON array:', responseText);
          throw new Error('Claude did not return a JSON array as expected');
        }
        return panelData;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Raw response:', responseText);
        throw new Error('Failed to parse panel data from Claude response');
      }
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);
      console.error('Error details:', error.response?.status, error.response?.statusText);
      console.error('Stack trace:', error.stack);
      throw new Error('Failed to generate diary content with Claude: ' + (error.message || 'Unknown error'));
    }
  }
}

module.exports = new ClaudeService();
