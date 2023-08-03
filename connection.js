import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

export async function connectToDatabase() {
  try {
    // Connect to MongoDB Atlas
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    return 1;
  } catch (err) {
    console.error('Error connecting to MongoDB Atlas:', err);
    return 0;
  }
}
// connectToDatabase();

// a reference to the database and collections
const db = client.db('NeversparkTask');
const collect = db.collection('neverspark');

// Insert a document
 export const createDocument = async (name,profile,email,token) => {
  try{
    const userData = ({
      name : name,
      profile: profile,
      email: email,
      token: token
    })

    
    const result  = await collect.insertOne(userData);
    return result;
    // console.log(result);
  }
  catch(err){
    console.log(err);
  }
}
// createDocument(); 


// find existed document

export const findDocument = async (email) => {
  try{
    const result = await collect.findOne({email});
    return result;
  }
  catch(err){
    console.log(err);
  }
}

export const findDocById = async (id) => {
  try{
    const objectId = new ObjectId(id);
    console.log("objectId" + objectId);
    const result = await collect.findOne({_id:objectId});
    return result;
  }
  catch(err){
    console.log(err);
  }
}
// findDocument("admin123@gmai.com");


// Update password
export const updateDocument = async (email, newtoken, newPassword) => {
  try {
    // Add a filter to find the document with the provided token
    const filter = { email: email };
    const updateData  = {
      $set: {
        token : newtoken,
        password : newPassword
      }
    }
    // Use the 'updateOne' method to update the document with the provided updateData
    const result = await collect.updateOne(filter, updateData);
    console.log(result);
    // Check if the update was successful and log the result
    if (result.matchedCount > 0) return result.matchedCount;
  } catch (err) {
    console.log('Error while updating document:', err);
  }
};
