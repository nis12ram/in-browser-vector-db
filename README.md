# in-browser-vector-db

## Features

- Supports Binary vector.
- Promise based implementation.
- Supports Web Worker.


## Installation

```bash
  npm i in-browser-vector-db
```
    
## Quick Start

#### For float32(fp32) vectors.
```
import { Connection, getUniqueInteger } from "in-browser-vector-db";
const connection = new Connection();
const dbConnection = await connection.openDb(dbName);
const vectorBlockConnection = await dbConnection.openVectorBlock(vectorBlockName);
await vectorBlockConnection.configureVectorBlock({ vectorDimension: 384, vectorDType: 'float32' });
const insertmanyResult = await vectorBlockConnection.operations.insertMany({ indices: [getUniqueInteger(),getUniqueInteger(),getUniqueInteger()], texts: ["what is earth?","what is web?","what is vector db"], vectors: [[0.01...],[0.01...],[0.01...]], metadataArray: [{name:"test0",age:30,hobby:["dancing"]},{name:"test1",age:40,hobby:["running"]},{name:"test2",age:50,hobby:["cooking"]}] });
const searchResult = await vectorBlockConnection.operations.search({ queryVector: [0.001...], topK: 6, vectorDistance: 'cosine', where:{ name: { $eq: "test1" }, age: { $lte: 50 }, hobby: { $nin: "dancing" } }});
```

#### For bool(uint8) vectors.
```
import { Connection, convertFloatToBinary, getUniqueInteger } from "in-browser-vector-db";
const connection = new Connection();
const dbConnection = await connection.openDb(dbName);
const vectorBlockConnection = await dbConnection.openVectorBlock(vectorBlockName);
await vectorBlockConnection.configureVectorBlock({ vectorDimension: 384, vectorDType: 'bool' });
const binaryVectors = convertFloatToBinary([[0.001....],[0.001....],[0.001....]]);
const insertmanyResult = await vectorBlockConnection.operations.insertMany({ indices: [getUniqueInteger(),getUniqueInteger(),getUniqueInteger()], texts: ["what is earth?","what is web?","what is vector db"], vectors: binaryVectors, metadataArray: [{name:"test0",age:30,hobby:["dancing"]},{name:"test1",age:40,hobby:["running"]},{name:"test2",age:50,hobby:["cooking"]}] });
const searchResult = await vectorBlockConnection.operations.search({ queryVector: [0.001...], topK: 6, vectorDistance: 'normHamming', where:{ name: { $eq: "test1" }, age: { $lte: 50 }, hobby: { $nin: "dancing" } }});
```


## Documentation

#### Starting the connection
```
import { Connection } from "in-browser-vector-db";
const connection = new Connection();

```

#### Opening the database.
```
const dbConnection = await connection.openDb("dbTest");

```

#### Opening the vectorblock.
```
// case-1(when no vectorBlock is opened)
const vectorBlockConnection = await dbConnection.openVectorBlock("vbTest1");

// case-2(when already a vectorBlock is opened)

// first close the opened vectorBlock.
dbConnection.closeVectorBlock();

// then open the vectorBlock.
const vectorBlockConnection = await dbConnection.openVectorBlock("vbTest1");

```

#### Configure the vectorblock.
```
await vectorBlockConnection.configureVectorBlock({ vectorDimension: 768, vectorDType: 'float32' });

```

#### Insert the entry.
```
const insertResult = await vectorBlockConnection.operations.insert({ index: 0, text: "hello test.", vector: [0.000001 ,....], metadata: {name: "test",age: 30,hobby:["dancing","running"]} });

```

#### Insert many entries.
```
const insertManyResult = await vectorBlockConnection.operations.insertMany({ indices:[0], texts: ["hello test."], vectors: [[0.000001 ,....]], metadataArray: [{name: "test"}] });

```

#### Update the entry.
```
const updateResult = await vectorBlockConnection.operations.update(index, { text: "what about you?", vector: [0.001...],metadata:{name:"test00"} });


```

#### Update many entries.
```
const updateManyResult = await vectorBlockConnection.operations.updateMany(indices, { texts: ["what about you?","How are you?"], vectors: [[0.001...],[0.001...]],metadataArray:[{name:"test00"},{name:"test11"}] });


```

#### Get the entry by id.
```
const entryAtIndexZero = await vectorBlockConnection.operations.getByIndex(0);

```

#### Get the entries by ids.
```
const entries = await vectorBlockConnection.operations.getByIndices([0,1,2]);

```

#### Delete the entry by id.
```
const deleteResult = await vectorBlockConnection.operations.deleteByIndex(0);

```

#### Delete the entries by ids.
```
const deleteResults = await vectorBlockConnection.operations.deleteByIndices([0,1,2]);

```

#### Delete all entries.
```
const deleteAllResult = await vectorBlockConnection.operations.deleteAll();

```

#### Search the similar entries.
```
const serachResult = await search({queryVector: [0.001...], vectorDistance: 'cosine',topK: 5,where:{ name: { $eq: "test" }, age: { $lte: 50 }, hobby: { $in: "dancing" } }});

```

#### Close the opened vectorblock.
```
const closeResult =  dbConnection.closeVectorBlock();

```

#### Delete the  vectorblock.
```
const deleteResult =  await dbConnection.deleteVectorBlock("vbTest1")

```

#### Delete the database .
```
 // case-1(when vectorBlock is opened)

 const connection = new Connection();
 const dbConnection = await connection.openDb('test');
 const vectorBlockConnection = await dbConnection.openVectorBlock('vbTest1');
 // first close the open vectorBlock.
 console.log(dbConnection.closeVectorBlock());
 // then delete the db.
 console.log(await connection.deleteDb('test'));

 // case-2(when no vectorBlock is opened)

 const connection = new Connection();
 const dbConnection = await connection.openDb('test');
 console.log(await connection.deleteDb('test'));


```
