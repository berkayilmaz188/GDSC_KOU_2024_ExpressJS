const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const advertRouter = require('./routes/advertRouter');
const categoriesRouter = require('./routes/categoriesRouter');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const cors = require('cors');


app.use(
  cors({
    origin: ['http://app.welfare.ws'],
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    credentials: true,
  })
);

connectDB(); 

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/photos', express.static(path.join(__dirname, 'photos')));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/advert', advertRouter);
app.use('/api/v1/categories', categoriesRouter);

app.listen(PORT, () => {
  console.log(`${PORT} server started.`);
});

