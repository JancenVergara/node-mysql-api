import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import errorHandler from './_middleware/error-handler';
import accountsController from './accounts/accounts.controller';
import swaggerDocs from './_helpers/swagger';
import { initialize } from './_helpers/db';
import appConfig from './_helpers/app-config';

const app = express();

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || appConfig.corsOrigins.length === 0 || appConfig.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use('/accounts', accountsController);
app.use('/api-docs', swaggerDocs);
app.use(errorHandler);

const port = Number(process.env.PORT) || 4000;

initialize()
    .then(() => {
        app.listen(port, '0.0.0.0', () => console.log('Server listening on port ' + port));
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
