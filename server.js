'use strict';

// require statement (importing packages).
let express = require('express');

// initializations and configurations of the packages.
let app = express();
require('dotenv').config();

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log('this app is listening on port '+ PORT);
});



