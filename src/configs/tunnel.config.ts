// import tunnel from 'tunnel-ssh';
const tunnel = require('tunnel-ssh');
import * as dotenv from 'dotenv';
// import mysql from 'mysql';

dotenv.config();

const ssh_config = {
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT,
  dstHost: process.env.DB_HOST, // 서버 내부에서 사용할 HOST(Localhost)
  dstPort: process.env.DB_PORT, // 서버 내부에서 사용할 Port(DB Port)
};

tunnel(ssh_config, (error, server) => {
  if (error) {
    throw error.toString();
  } else if (server !== null) {
    console.log('Connection!'); //Connection!
  }
});

// tunnel(ssh_config, (error, server) => {
//   if (error) {
//     throw error;
//   } else if (server !== null) {
//     mysql
//       .createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USERNAME,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_DATABASE,
//       })
//       .execute('SHOW TABLES from test;', (err, result, fields) => {
//         if (err) throw err;
//         console.log(result);
//       });
//   }
// });
