
import "dotenv/config";

import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";

import connectDB from "./config/db.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import buildContext from "./graphql/context.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
    })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        const apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
        });

        await apolloServer.start();

        app.get("/", (req, res) => {
            res.send("Bugdesk Backend is running!");
        });

        app.use(
            "/graphql",
            expressMiddleware(apolloServer, {
                context: async ({ req }) => buildContext(req),
            })
        );

        app.listen(PORT, () => {
            console.log(`Bugdesk server running on port ${PORT}`);
            console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
        });
    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();
