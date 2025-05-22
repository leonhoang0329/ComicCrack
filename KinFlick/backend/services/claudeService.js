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
   * @param {Function} progressCallback - Callback function to report progress
   * @return {Promise<string>} Generated diary content
   */
  async generateDiaryContent(photos, progressCallback = null) {
    try {
      // Check if API key is set
      if (!this.apiKey || this.apiKey === 'your_claude_api_key_here') {
        console.error('CLAUDE_API_KEY is not set or is using the default value');
        throw new Error('Claude API key is not configured properly');
      }
      
      console.log('Claude API Key available:', !!this.apiKey);
      console.log(`Processing ${photos.length} photos for diary generation`);

      // Process photos one by one
      const allResults = [];
      const totalPhotos = photos.length;
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        
        try {
          // Report progress
          if (progressCallback) {
            progressCallback({
              currentPhoto: i + 1,
              totalPhotos,
              percentComplete: Math.round(((i) / totalPhotos) * 100),
              photoId: photo._id,
              status: 'processing'
            });
          }
          
          console.log(`Processing photo ${i+1}/${totalPhotos}: ${photo._id}`);
          console.log(`Reading photo from path: ${photo.path}`);
          
          // Check if file exists before reading
          if (!fs.existsSync(photo.path)) {
            console.error(`Photo file does not exist: ${photo.path}`);
            
            // Add default content for failed photo
            allResults.push({
              punchline: "Image processing failed",
              description: "Our AI couldn't process this image. Please try again or choose a different photo."
            });
            
            // Report failed photo
            if (progressCallback) {
              progressCallback({
                currentPhoto: i + 1,
                totalPhotos,
                percentComplete: Math.round(((i + 1) / totalPhotos) * 100),
                photoId: photo._id,
                status: 'failed'
              });
            }
            
            continue; // Skip to next photo
          }
          
          // Prepare message content for this specific photo
          const content = [];
          
          // Add text part
          content.push({
            type: 'text',
            text: 'For this photo, generate: 1) A VERY witty, hilarious punchline (just one short sentence - be clever, unexpected and truly funny) and 2) A separate humorous mini-story (2-3 sentences) related to what\'s happening in the image. DON\'T just describe what\'s in the photo. Instead: Use wordplay, puns, or clever observations. Be absurd, exaggerated or unexpected. Consider sarcasm, irony or satirical angles. Channel comedy styles like Mitch Hedberg, Jerry Seinfeld, or Sarah Silverman. Format the response as a JSON object with "punchline" and "description" fields. Examples of GREAT punchlines: "I asked the gym why they had no stairs. They said they\'re a no-step program." "My bed is like a magical place where I suddenly remember everything I was supposed to do." "I\'m not saying your coffee is weak, but it\'s currently applying for motivational seminars." "Cats: proving that if you act like you own the place, everyone will assume you do." Full example: {"punchline": "My kitchen and I have reached a compromise: I won\'t cook, it won\'t catch fire.", "description": "The smoke alarm had started charging me rent since we spent so much time together. Yesterday, I caught it updating its resume with \'five years experience as a dinner critic\'."}'
          });
          
          // Add image part
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
          
          console.log('Making request to Claude API for photo', i+1);
          // Make API request to Claude for this single photo
          const requestBody = {
            model: 'claude-3-opus-20240229',
            max_tokens: 500, // Reduced tokens for single photo
            messages: [
              {
                role: 'user',
                content
              }
            ]
          };
          
          const response = await axios.post(
            this.baseUrl,
            requestBody,
            {
              headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
              },
              timeout: 30000 // 30 second timeout for single photo
            }
          );
          
          console.log(`Claude API responded successfully for photo ${i+1} with status:`, response.status);
          
          if (!response.data || !response.data.content || !response.data.content[0]) {
            console.error('Unexpected API response structure:', JSON.stringify(response.data));
            throw new Error('Unexpected response format from Claude API');
          }
          
          const responseText = response.data.content[0].text;
          
          try {
            // Parse the JSON response
            const panelData = JSON.parse(responseText);
            allResults.push(panelData);
            
            // Report successful photo processing
            if (progressCallback) {
              progressCallback({
                currentPhoto: i + 1,
                totalPhotos,
                percentComplete: Math.round(((i + 1) / totalPhotos) * 100),
                photoId: photo._id,
                status: 'completed',
                result: panelData
              });
            }
            
            console.log(`Successfully processed photo ${i+1}/${totalPhotos}`);
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Raw response:', responseText);
            
            // Add default content for parse error
            allResults.push({
              punchline: "Processing error",
              description: "Our AI generated content that couldn't be processed correctly. Please try again."
            });
            
            // Report parsing error
            if (progressCallback) {
              progressCallback({
                currentPhoto: i + 1,
                totalPhotos,
                percentComplete: Math.round(((i + 1) / totalPhotos) * 100),
                photoId: photo._id,
                status: 'error'
              });
            }
          }
          
        } catch (photoError) {
          console.error(`Error processing photo ${photo._id}:`, photoError);
          
          // Add default content for error
          allResults.push({
            punchline: "Error occurred",
            description: "There was an error processing this image. Please try again or choose a different photo."
          });
          
          // Report error
          if (progressCallback) {
            progressCallback({
              currentPhoto: i + 1,
              totalPhotos, 
              percentComplete: Math.round(((i + 1) / totalPhotos) * 100),
              photoId: photo._id,
              status: 'error'
            });
          }
        }
      }
      
      // If no photos were processed successfully, throw an error
      if (allResults.length === 0) {
        throw new Error('No photos could be processed');
      }
      
      // Final progress update
      if (progressCallback) {
        progressCallback({
          currentPhoto: totalPhotos,
          totalPhotos,
          percentComplete: 100,
          status: 'complete'
        });
      }
      
      return allResults;
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);
      console.error('Error details:', error.response?.status, error.response?.statusText);
      console.error('Stack trace:', error.stack);
      throw new Error('Failed to generate diary content with Claude: ' + (error.message || 'Unknown error'));
    }
  }
}

module.exports = new ClaudeService();
