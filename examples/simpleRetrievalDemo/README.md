## simpleRetreivalDemo

> [!NOTE]  
> All ingestion and retrieval code is inside src/pipeline.
> For chunking regexBaseSplitter is used ,chunk embeddings are computed using nomic-ai/nomic-embed-text-v1.5 ,strategy used for chunk embedding is late chunking(https://jina.ai/news/late-chunking-in-long-context-embedding-models/)
> Entire ingestion and retrieval is handled using web worker src/worker.js