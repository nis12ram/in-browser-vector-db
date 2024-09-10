import { useCallback, useEffect, useState, useRef } from "react"
import DisplayResult from "./components/DisplayResult";
function App() {
  const [loading, setLoading] = useState(true);
  const [userQuery, setuserQuery] = useState('');
  const [retrievedResult, setRetrievedResult] = useState([])
  const worker = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }
    console.log(worker.current);


    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      console.log(e.data);
      const { mode, success, result } = e.data;
      if (success) setLoading(false);
      if (mode === 'retrieval') {
        setRetrievedResult(() => result.map(i => i[0].text));
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);
    worker.current.onerror = (e) => {
      console.log(e);
    }
    worker.current.postMessage({
      mode: 'instance'
    });

    // Define a cleanup function for when the component is unmounted.
    return () => {
      worker.current.removeEventListener('message', onMessageReceived);
      worker.current.terminate()
    }
  }, [])


  const startIngestion = useCallback(async (event) => {
    const file = event.target.files[0];
    worker.current.postMessage({
      mode: 'ingestion',
      input: { fileType: 'txt', file }
    });
    setLoading(true)
  }, [])

  const startRetrieval = useCallback((e) => {
    e.preventDefault()

    worker.current.postMessage({
      mode: 'retrieval',
      input: { query: userQuery, topK: 3 }
    })
    setLoading(true)
  }, [userQuery]);
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center">
          {/* Loader: a simple spinning circle */}
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        </div>
      ) : (
        <>
          <input
            type="file"
            name=""
            id=""
            accept=".txt"
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            onChange={startIngestion}
          />
          <form onSubmit={startRetrieval} className="flex space-x-2">
            <input
              type="text"
              name=""
              id=""
              className="block w-full p-2 text-sm text-gray-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={userQuery}
              onChange={e => setuserQuery(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </form>


          {retrievedResult?.map(text => (
            <DisplayResult searchResult={{ data: text }} />
          ))}
        </>
      )}
    </div>
  );
};


export default App;
