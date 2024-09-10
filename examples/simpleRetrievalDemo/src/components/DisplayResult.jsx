import { useState } from "react"

function DisplayResult({ searchResult }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data } = searchResult
    return (
        <div className="flex flex-col shadow-md shadow-black rounded-b-2xl  ">
            <div className={`w-full text-sm flex justify-between  bg-[#E0FBE2] rounded-lg px-3 pb-1 titillium-web-bold `}>
                <button
                    onClick={() => {
                        setIsExpanded(prev => (!prev))
                    }}
                >
                    {isExpanded ? "🔼" : "🔽"}
                </button>
            </div>
            <div className={`text-xl text-black px-3 titillium-web-semi-bold ${isExpanded ? "max-h-[700px] " : "max-h-20  cursor-pointer"} overflow-hidden transition-all duration-1000 ease-in-out `}
                onClick={() => {
                    setIsExpanded(true)
                }}>
                {data}
            </div>
        </div>
    )
}
export default DisplayResult;