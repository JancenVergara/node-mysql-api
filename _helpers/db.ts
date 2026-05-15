import appConfig from './app-config';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import accountModel from '../accounts/account.model';
import refreshTokenModel from '../accounts/refresh-token.model';

let db: any = {};

export function getDb() {
    return db;
}

export async function initialize() {
    console.log('Initializing database...');
    const { host, port, user, password, database, ssl, createDatabase } = appConfig.database;
    const dialectOptions = ssl ? { ssl: { rejectUnauthorized: false } } : {};

    if (createDatabase) {
        const connection = await mysql.createConnection({ host, port, user, password, ssl: ssl ? { rejectUnauthorized: false } : undefined });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await connection.end();
    }

    const sequelize = new Sequelize(database, user, password, {
        host,
        port,
        dialect: 'mysql',
        dialectOptions,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    });

    db.Account = accountModel(sequelize);
    db.RefreshToken = refreshTokenModel(sequelize);

    db.Account.hasMany(db.RefreshToken, { foreignKey: 'accountId' });
    db.RefreshToken.belongsTo(db.Account, { foreignKey: 'accountId' });

    await sequelize.sync();
    console.log('Database initialized!');
    console.log('db.Account:', db.Account ? 'OK' : 'UNDEFINED');
    console.log('db.RefreshToken:', db.RefreshToken ? 'OK' : 'UNDEFINED');
}

export default db;
