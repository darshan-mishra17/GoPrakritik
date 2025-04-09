const express= require('express');
const connectDB = require('./db/connection')
const app=express();
require('dotenv').config();
const PORT=process.env.PORT || 5001;
connectDB();
app.listen(PORT,'0.0.0.0',()=>{console.log(`Server running on port ${PORT}`);
});