const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
const app = express();



app.use(express.json());
app.use(cors());

 const Authroute = require('./route/Auth');
const Postroute = require('./route/postroute');
const Profileroute = require('./route/Profileroute');

 app.use('/api',Authroute);
 app.use('/api',Postroute);
 app.use('/api',Profileroute);

mongoose.connect(
      config.get("mongodb_uri"),
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
).then(
    ()=>{
        console.log('MongoDB server Connected');
    },
    (err)=>{
        console('MongoDB connection failed',err);
    }
);

app.listen(config.get("PORT"),
       ()=>{
          console.log('Server is Up and running on port No ',config.get("PORT"));
})