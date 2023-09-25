import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.css";
import React, { useState, useEffect, useRef } from "react";

interface JsonDataState {
  page: {
    title: string;
    "content-items": {
      content: any[];
    };
  };
}

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [jsonData, setJsonData] = useState<JsonDataState>({
    page: { "content-items": { content: [] }, title: "" },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // Function to toggle the visibility of the input field
  const toggleInputVisibility = () => {
    setInputVisible((prevVisible) => !prevVisible);
  };

  // Function to fetch JSON data
  const fetchJsonData = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok for URL: ${url}`);
      }
      const data = await response.json();
      setJsonData((prevData) => ({
        ...prevData,
        page: {
          ...prevData.page,
          "content-items": {
            content: [
              ...prevData.page["content-items"].content,
              ...data.page["content-items"].content,
            ],
          },
        },
      }));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching JSON data:", error);
      setIsLoading(false);
    }
  };

  // Function to load initial viewport items from page1.json
  const loadInitialData = () => {
    fetchJsonData("https://test.create.diagnal.com/data/page1.json");
    setCurrentPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    // Load initial viewport items on component mount
    loadInitialData();
  }, []);

  // Function to handle scrolling and load more items
  const handleScroll = () => {
    if (
      lastItemRef.current &&
      window.innerHeight + window.scrollY >= lastItemRef.current.offsetTop &&
      !isLoading &&
      hasMore
    ) {
      fetchJsonData(
        `https://test.create.diagnal.com/data/page${currentPage}.json`
      );
      setCurrentPage((prevPage) => prevPage + 1);
      // You can adjust the number of pages to load here
      setHasMore(currentPage < 3);
    }
  };

  useEffect(() => {
    // Attach the scroll event listener
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage, isLoading, hasMore]);

  // Filter the items based on the search query
  const filteredItems = jsonData.page["content-items"].content.filter(
    (item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // if "No results found" should be displayed
  const noResultsFound = filteredItems.length === 0 && searchQuery.length > 0;

  // Render the JSON data
  return (
    <>
      <nav className="navbar sticky-top">
        <div className=" grid-thirds container ">
          <div className="d-flex">
            <div className="naviarrow"></div>
            <h3>Romantic Comedy</h3>
          </div>

          <div className="search-bar">
            <img
              className="searchicon"
              onClick={toggleInputVisibility}
              src="https://test.create.diagnal.com/images/search.png"
              alt="Search Icon"
            ></img>
            {isInputVisible && (
              <input
                className="searchinput"
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <h2>{jsonData.page.title}</h2>
        <div className="row p-cont">
          {filteredItems.map((item: any, index: number) => (
            <div className="col-sm-4 contnt" key={index}>
              {item["poster-image"] ? (
                <img
                  src={`https://test.create.diagnal.com/images/${item["poster-image"]}`}
                  alt={item.name}
                />
              ) : (
                <img
                  src="https://test.create.diagnal.com/images/placeholder_for_missing_posters.png"
                  alt="Image is not loaded"
                />
              )}
              <h4 className="mt-3">{item.name}</h4>

              {/* Check if it's the last item and set the ref */}
              {index === filteredItems.length - 1 && (
                <div ref={lastItemRef}></div>
              )}
            </div>
          ))}
        </div>

        <div className="results">
          {noResultsFound && <p>No results found</p>}
        </div>
        {isLoading && <p className="contnt">Loading...</p>}
      </div>
    </>
  );
}

export default App;
