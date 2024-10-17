import CredentialsProvider from 'next-auth/providers/credentials'
import { SiweMessage } from 'siwe';
import { getPublicKey } from "/src/lib/db-client";
import { signIn, getCsrfToken } from "next-auth/react";
import { handleLogin } from "/src/lib/kmaas-client"

const nextAuthSecret = process.env.NEXTAUTH_SECRET
if (!nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET is not set')
}

const providers = [
  CredentialsProvider({
    name: 'KMaaS',
    id: 'KMaaS',
    type: "credentials",
    credentials: {
      username: {
        label: 'Username',
        type: 'text',
        placeholder: ''
      },
      password: {
        label: 'Password',
        type: 'password',
        placeholder: ''
      }
    },
    async authorize(credentials) {
      try {
        const {username, password} = credentials;
        const publicKey = await getPublicKey(username);
        const nonce = await getCsrfToken();
        const siweMessage = new SiweMessage({
            domain: "localhost",
            uri: "http://localhost:3000",
            origin: "http://localhost:3000",
            version: "1",
            address: publicKey,
            statement: "Sign in with Oasis KMaaS to the app",
            chainId: 23293,
            nonce: nonce
        });

        const bearerToken = await handleLogin(username, siweMessage.prepareMessage(), password);
        return {
            "publicKey": siweMessage.address,
            "username": username,
            "bearerToken": bearerToken
          }
      } catch (e) {
        console.log("Verification failed");
        console.log(e);
        return null
      }
    },
  })
]

export const options = {
  secret: nextAuthSecret,
  providers,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.username = user.username;
          token.publicKey = user.publicKey;
          token.bearerToken = user.bearerToken;
        }
        return token;
      },
      async session({ session, token }) {
        session.user.username = token.username;
        session.user.publicKey = token.publicKey;
        session.user.bearerToken = token.bearerToken;
        return session;
      },
      async redirect({url, baseUrl}) {
        // Any redirect will always redirect to the notes page
        return baseUrl;
      }
  }
};