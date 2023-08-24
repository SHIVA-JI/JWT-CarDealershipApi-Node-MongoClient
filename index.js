import express from "express";
const router = express.Router();

import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';

import path from "path";
import { fileURLToPath } from "url";

import { faker } from '@faker-js/faker';

import {createDocument,connectToDatabase,findDocument,updateDocument,findDocById} from "./connection.js"; // automaticalys this file is missing
// For User
import {dealerAllCars,dealerAllSoldCars,dealerAddCars,dealerProvidedCars,dealerAddDeals,dealerAllSoldVehicles,dealerAddNewToSold} from './carDealApi.js';
// For Dealer
import {viewAllCars,carsInDealership,dealsCertainDealership,buyCar} from './carDealApi.js';

import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY

const app = express();

// parsers middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// User api endpoints middleware for user
app.use(viewAllCars);
app.use(carsInDealership);
app.use(dealsCertainDealership);
app.use( buyCar)

// User api endpoints middleware for dealer

app.use(dealerAllCars);
app.use(dealerAllSoldCars);
app.use(dealerAddCars);
app.use(dealerProvidedCars);
app.use(dealerAddDeals);
app.use(dealerAllSoldVehicles);
app.use(dealerAddNewToSold);


// const __filename = new URL(import.meta.url).pathname;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const auth = async(req,res,next) => {
  try{
    const cookieToken = req.cookies.jwt;
    const id = req.cookies.uid;
    const uid = String(id);
    const payload = jwt.verify(uid,SECRET_KEY);
    const result = await findDocById(payload._id);
    if(result.token === cookieToken) {
      next();
    }
    else{
      res.send("Please login first");
    }
  }
  catch(err) {
    console.log(err);
    res.send("Please Login First");
  }
}



app.get('/logout', auth, (req,res) => {
  try{
    res.clearCookie("jwt");
    res.clearCookie("uid");
    const filePath = path.join(__dirname, "./html/signin.html");
    res.sendFile(filePath);
  }
  catch(err) {
    res.send(err);
  }
  
})


app.get('/signup.html',(req,res) => {
  try{
    const filePath = path.join(__dirname, "./html/signup.html");
    res.sendFile(filePath);
  }
  catch(err){
    console.log(err);
  }
})

app.post('/signup/submitted', async(req,res) => {
  const name = req.body.name;
  const profile = req.body.profile;
  const email = req.body.email;
  const pass = req.body.password;
  const cpass = req.body.confirmPassword;
  try{
    await connectToDatabase();
    const check = await findDocument(email);
    if( check && check.email === email){
      res.send(`Account with given email '${email}' already exist.`);
    }
    else if(pass == cpass ){
      const tokens = []
      const newToken = jwt.sign(pass,SECRET_KEY);
      const result = await createDocument(name,profile,email,newToken);
      if(result){
        res.send(`Congrats ${name} you succesfully created account. \n Please go back and sign in.`)
      }
    }
    else{
      res.send("Password must be same.");
    }
  }
  catch(err){
    res.send(err);
  } 
})


app.get('/',(req,res) => {
  try{
    const filePath = path.join(__dirname, "./html/signin.html");
    res.sendFile(filePath);
  }
  catch(err){
    console.log(err);
  }
})

app.post('/signin/submitted', async(req,res) => {
  try{
    const email = req.body.email;
    const pass = req.body.password;
    const connect = await connectToDatabase();
    if(connect === 0) res.send("MongoNetworkError: connect ETIMEDOUT ");
    const result = await findDocument(email);
    if(result) {
      const cuurentToken = jwt.sign(pass,SECRET_KEY);
      if(result.token === cuurentToken){
        res.cookie("jwt",cuurentToken,{
          // expires:new Date(Date.now() + 130000),
          httpOnly:true
        });
        const payload = {
          _id: result._id,
        };
        const uid = jwt.sign(payload,SECRET_KEY);
        res.cookie("uid",uid,{
          // expires:new Date(Date.now() + 130000),
          httpOnly:true
        });
        const filePath = path.join(__dirname, "./html/landing.html");
        res.sendFile(filePath);
      }
    }
    else {
      res.send(`No account with this "${email}" exist.`);
    }
  }
  catch(err){
    console.log(err);
  }
})



app.get('/signin/changePass.html',auth,(req,res) => {
  // console.log(req.cookies.jwt);
  try{
    const changePass = path.join(__dirname, "./html/changePass.html");
    res.sendFile(changePass);
  }
  catch(err){
    console.log(err);
  }
})

app.post('/changePassword' , async(req,res) => {
  const email = req.body.email;
  const oldPass = req.body.oldPass;
  const newPass = req.body.newPass;
  const confirmNewPass = req.body.cNewPass;

  if(oldPass == newPass){
    res.send("Previous password and new password cannot be same.");
  }
  else if(newPass != confirmNewPass){
    res.send("Confirm password  field must be same as the new password field.");
  }
  else{
    try{
      await connectToDatabase();
      const check = await findDocument(email);
      if( check && check.email === email){
        const oldPassToken = jwt.sign(oldPass,SECRET_KEY);
        if(oldPassToken === check.token) {
          const newToken = jwt.sign(newPass,SECRET_KEY);
          const updatePass = await updateDocument(email,newToken,newPass);
          if(updatePass){
            res.send("Password changed successfully");
          }
          else{
            res.send("Internal server error");
          }
        }
        else{
          res.send("Wrong old PassWord");
        }
      }
      else{
        res.send(`No account with  email ${email} exist`);
      }
    }
    catch(err){
      res.send(err);
    }
  }
  
})




app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
