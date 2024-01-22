import { tunnel } from 'tunnel-ssh';
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

// import {
//   TunnelOptions,
//   ServerOptions,
//   SshOptions,
//   ForwardOptions,
//   createTunnel,
// } from 'tunnel-ssh';
// import * as dotenv from 'dotenv';
// dotenv.config();

// // 모든 클라이언트 연결이 끊어졌을 때 터널이 자동으로 닫히길 바란다면 True 설정
// //    * useful for cli scripts or any other short lived processes.
// //    * @default false
// const tunnelOptions: TunnelOptions = {
//   autoClose: false,
// };

// // export type ServerOptions = ListenOptions;
// // interface ListenOptions extends Abortable {
// //   port?: number | undefined;
// //   host?: string | undefined;
// //   backlog?: number | undefined;
// //   path?: string | undefined;
// //   exclusive?: boolean | undefined;
// //   readableAll?: boolean | undefined;
// //   writableAll?: boolean | undefined;
// //   /**
// //    * @default false
// //    */
// //   ipv6Only?: boolean | undefined;
// // }
// const serverOptions: ServerOptions = {
//   port: process.env.DB_PORT,
//   host: process.env.DB_HOST,
// };

// // export interface ConnectConfig {
// //   /** Hostname or IP address of the server. */
// //   host?: string;
// //   /** Port number of the server. */
// //   port?: number;
// //   /** Only connect via resolved IPv4 address for `host`. */
// //   forceIPv4?: boolean;
// //   /** Only connect via resolved IPv6 address for `host`. */
// //   forceIPv6?: boolean;
// //   /** The host's key is hashed using this method and passed to `hostVerifier`. */
// //   hostHash?: string;
// //   /** Verifies a hexadecimal hash of the host's key. */
// //   hostVerifier?: HostVerifier | SyncHostVerifier | HostFingerprintVerifier | SyncHostFingerprintVerifier;
// //   /** Username for authentication. */
// //   username?: string;
// //   /** Password for password-based user authentication. */
// //   password?: string;
// //   /** Path to ssh-agent's UNIX socket for ssh-agent-based user authentication (or 'pageant' when using Pagent on Windows). */
// //   agent?: BaseAgent | string;
// //   /** Buffer or string that contains a private key for either key-based or hostbased user authentication (OpenSSH format). */
// //   privateKey?: Buffer | string;
// //   /** For an encrypted private key, this is the passphrase used to decrypt it. */
// //   passphrase?: Buffer | string;
// //   /** Along with `localUsername` and `privateKey`, set this to a non-empty string for hostbased user authentication. */
// //   localHostname?: string;
// //   /** Along with `localHostname` and `privateKey`, set this to a non-empty string for hostbased user authentication. */
// //   localUsername?: string;
// //   /** Try keyboard-interactive user authentication if primary user authentication method fails. */
// //   tryKeyboard?: boolean;
// //   /** How often (in milliseconds) to send SSH-level keepalive packets to the server. Set to 0 to disable. */
// //   keepaliveInterval?: number;
// //   /** How many consecutive, unanswered SSH-level keepalive packets that can be sent to the server before disconnection. */
// //   keepaliveCountMax?: number;
// //   /** * How long (in milliseconds) to wait for the SSH handshake to complete. */
// //   readyTimeout?: number;
// //   /** Performs a strict server vendor check before sending vendor-specific requests. */
// //   strictVendor?: boolean;
// //   /** A `ReadableStream` to use for communicating with the server instead of creating and using a new TCP connection (useful for connection hopping). */
// //   sock?: Readable;
// //   /** Set to `true` to use OpenSSH agent forwarding (`auth-agent@openssh.com`) for the life of the connection. */
// //   agentForward?: boolean;
// //   /** Explicit overrides for the default transport layer algorithms used for the connection. */
// //   algorithms?: Algorithms;
// //   /** A function that receives a single string argument to get detailed (local) debug information. */
// //   debug?: DebugFunction;
// //   /** Function with parameters (methodsLeft, partialSuccess, callback) where methodsLeft and partialSuccess are null on the first authentication attempt, otherwise are an array and boolean respectively. Return or call callback() with the name of the authentication method to try next (pass false to signal no more methods to try). Valid method names are: 'none', 'password', 'publickey', 'agent', 'keyboard-interactive', 'hostbased'. Default: function that follows a set method order: None -> Password -> Private Key -> Agent (-> keyboard-interactive if tryKeyboard is true) -> Hostbased. */
// //   authHandler?: AuthenticationType[] | AuthHandlerMiddleware | AuthMethod[];
// //   /** IP address of the network interface to use to connect to the server. Default: (none -- determined by OS) */
// //   localAddress?: string;
// //   /** The local port number to connect from. Default: (none -- determined by OS) */
// //   localPort?: number;
// //   /** The underlying socket timeout in ms. Default: none) */
// //   timeout?: number;
// //   /** A custom server software name/version identifier. Default: 'ssh2js' + moduleVersion + 'srv' */
// //   ident?: Buffer | string;
// // }
// const sshOptions: SshOptions = {
//   host: process.env.SSH_HOST,
//   port: process.env.SSH_PORT,
//   username: process.env.SSH_USER,
//   password: process.env.SSH_PASSWORD,
//   // Add other SSH options as needed
// };

// /**
//  * If the `srcAddr` or `srcPort` is not defined, the adress will be taken from the local TCP server
//  */
// // interface ForwardOptions {
// //   /*
// //   * The address or interface we want to listen on.
// //   * @default ServerOptions.address
// //   **/
// //   srcAddr?: string;
// //   /*
// //   * The port or interface we want to listen on.
// //   * @default ServerOptions.port
// //   **/
// //   srcPort?: number;
// //   /*
// //   * the address we want to forward the traffic to.
// //   * @default "0.0.0.0"
// //   **/
// //   dstAddr?: string;
// //   /*
// //   * the port we want to forward the traffic to.
// //   */
// //   dstPort: number;
// // }
// const forwardOptions: ForwardOptions = {
//   srcPort: process.env.SSH_PORT, // Set the local port you want to forward
//   dstPort: process.env.DB_PORT, // Set the remote port you want to forward to
// };

// async function tunnel() {
//   try {
//     const [localServer, sshClient] = await createTunnel(
//       tunnelOptions,
//       serverOptions,
//       sshOptions,
//       forwardOptions,
//     );
//     console.log('Connection!');

//     // The tunnel is now established, and you can use the local server and SSH client as needed.

//     // When done, you can close the tunnel
//     //localServer.close();
//     //sshClient.end();
//   } catch (error) {
//     console.error('Error creating tunnel:', error);
//   }
// }
