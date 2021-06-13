require('./db/mongoose');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');


const express = require('express');

const app = express();
const port = process.env.PORT;


// Middlewares
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next()
});
app.use(express.json());

// USER Resource Routes
app.use(userRouter);

// TASK Resource Routes
app.use(taskRouter);


// Server INIT
app.listen(port, ()=> {
    console.log('App is running on port', port)
});

