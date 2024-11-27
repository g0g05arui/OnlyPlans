const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const fileUpload = require('express-fileupload');

const userRouter = require('./controllers/user');
const authRouter = require('./controllers/auth');
const tierRouter = require('./controllers/tier');
const postRouter = require('./controllers/post');
const mealRouter = require('./controllers/meals');
const tokenMiddleWare = require('./middleware/token');
const enumsRouter = require('./controllers/enums');
const mediaController = require('./controllers/media');

async function main(){
    const app = express();

    const PORT = process.env.PORT || 3000;
    const database_uri = process.env.DATABASE_URI;
    const jwt_secret = process.env.JWT_SECRET;
    const bucket_id = process.env.GCLOUD_STORAGE_BUCKET;

    if(!database_uri)
        throw new Error("Missing DATABASE_URI , check .env");
    if(!jwt_secret)
        throw new Error("Missing JWT_SECRET , check .env");
    if(!bucket_id)
        throw new Error("Missing GCLOUD_STORAGE_BUCKET, check .env");
  
    await mongoose.connect(database_uri);
    app.enable("trust proxy");

    app.use(morgan('combined'));
    app.use(express.json());
    app.use(cors());
    app.use(fileUpload());
    const router = express.Router();

    app.get('/health', (req,res) => res.json({status:200,time:new Date().toISOString()}));
    app.use(tokenMiddleWare.parseToken);
    router.use('/enums',enumsRouter);
    router.use('/users',userRouter);
    router.use('/login',authRouter);
    router.use('/tiers',tierRouter);
    router.use('/posts',postRouter);
    router.use('/meals',mealRouter);
    router.use('/media',mediaController);
    app.use('/api',router);
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
    app.use((err, req, res, next) => res.status(500).json({message:"Internal Error"}));
    app.listen(PORT,() => console.log(`Started listening on port ${PORT}`));
}

main();