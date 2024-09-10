import { Connection } from "in-browser-vector-db";
export async function getDbComponentsInstance({ dbName, vectorBlockName, configuration }) {
    console.log('i have started creating instance');

    const connection = new Connection();
    const dbConnection = await connection.openDb(dbName);
    const vectorBlockConnection = await dbConnection.openVectorBlock(vectorBlockName);
    await vectorBlockConnection.configureVectorBlock(configuration);
    console.log('i have ended creating instance');
    return { connection, dbConnection, vectorBlockConnection };
};