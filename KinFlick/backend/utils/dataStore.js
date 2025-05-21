const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DataStore {
  constructor(collectionName) {
    this.dataDir = path.join(__dirname, '..', 'data', collectionName);
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async create(data) {
    // Generate a random ID if not provided
    const id = data._id || crypto.randomUUID();
    data._id = id;
    
    // Set creation timestamp if not present
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    
    const filePath = path.join(this.dataDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return data;
  }

  async findById(id) {
    try {
      const filePath = path.join(this.dataDir, `${id}.json`);
      const fileData = await fs.readFile(filePath, 'utf8');
      return JSON.parse(fileData);
    } catch (error) {
      return null;
    }
  }

  async findOne(query = {}) {
    const allFiles = await this.getFiles();
    
    for (const file of allFiles) {
      const data = await this.findById(file.replace('.json', ''));
      let matches = true;
      
      for (const [key, value] of Object.entries(query)) {
        // For nested fields like 'user._id'
        const fields = key.split('.');
        let dataValue = data;
        
        for (const field of fields) {
          if (dataValue && dataValue[field] !== undefined) {
            dataValue = dataValue[field];
          } else {
            dataValue = undefined;
            break;
          }
        }
        
        if (dataValue !== value) {
          matches = false;
          break;
        }
      }
      
      if (matches) {
        return data;
      }
    }
    
    return null;
  }

  async find(query = {}) {
    const allFiles = await this.getFiles();
    const results = [];
    
    for (const file of allFiles) {
      const data = await this.findById(file.replace('.json', ''));
      let matches = true;
      
      for (const [key, value] of Object.entries(query)) {
        if (key === '$in') {
          // Handle $in operator for arrays
          const [field, values] = Object.entries(value)[0];
          if (!values.includes(data[field])) {
            matches = false;
            break;
          }
        } else if (typeof value === 'object' && value !== null && value.$in) {
          // Handle nested $in operator (e.g., { _id: { $in: [...] } })
          if (!value.$in.includes(data[key])) {
            matches = false;
            break;
          }
        } else {
          // Handle direct field comparison
          if (data[key] !== value) {
            matches = false;
            break;
          }
        }
      }
      
      if (matches) {
        results.push(data);
      }
    }
    
    return results;
  }

  async updateOne(query, update) {
    const document = await this.findOne(query);
    
    if (!document) {
      return { modifiedCount: 0 };
    }
    
    const updatedDocument = { ...document };
    
    if (update.$set) {
      Object.assign(updatedDocument, update.$set);
    }
    
    await this.create(updatedDocument); // Overwrite with updated data
    
    return { modifiedCount: 1, document: updatedDocument };
  }

  async deleteOne(query) {
    const document = await this.findOne(query);
    
    if (!document) {
      return { deletedCount: 0 };
    }
    
    const filePath = path.join(this.dataDir, `${document._id}.json`);
    await fs.unlink(filePath);
    
    return { deletedCount: 1 };
  }
  
  async getFiles() {
    try {
      return await fs.readdir(this.dataDir);
    } catch (error) {
      return [];
    }
  }
}

module.exports = DataStore;