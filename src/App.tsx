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
  const [visibleItemCount, setVisibleItemCount] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState(
    "https://test.create.diagnal.com/images/posterthatismissing.jpg"
  );

  const handleImageError = () => {
    // Update the image URL to the placeholder URL when an error occurs
    setImageUrl(
      "https://test.create.diagnal.com/images/placeholder_for_missing_posters.png"
    );
  };

  useEffect(() => {
    setImageUrl(
      "https://test.create.diagnal.com/images/placeholder_for_missing_posters.png"
    );
  }, []);

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

  // load initial viewport items - page1.json
  const loadInitialData = () => {
    fetchJsonData("https://test.create.diagnal.com/data/page1.json");
    setCurrentPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // handle scrolling and load more items
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
      setHasMore(currentPage < 3);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage, isLoading, hasMore]);

  // Filtser the items
  const filteredItems = jsonData.page["content-items"].content.filter(
    (item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearchQuery = () => {
    setSearchQuery("");
  };
  const clearIcon = searchQuery ? (
    <img className="clearicon" onClick={clearSearchQuery} />
  ) : null;

  // No results found
  const noResultsFound = filteredItems.length === 0 && searchQuery.length > 0;

  // Render the JSON data
  return (
    <>
      <nav className="navbar sticky-top">
        <div className=" grid-thirds container ">
          <div className="d-flex">
            <div className="naviarrow" onClick={clearSearchQuery}></div>
            <h3>Romantic Comedy</h3>
          </div>

          <div className="items-loaded">
            #{""}
            {jsonData.page["content-items"].content.length}
          </div>

          <div className="search-bar">
            <img
              className="searchicon"
              onClick={toggleInputVisibility}
              src="https://test.create.diagnal.com/images/search.png"
              alt="Search Icon"
            ></img>
            {isInputVisible && (
              <div className="search-input-container">
                <input
                  type="text"
                  required
                  className="search-box searchinput"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="close-icon" onClick={clearSearchQuery}></span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-5">
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
                  src={imageUrl}
                  alt="Movie Poster"
                  onError={handleImageError}
                />
              )}
              <h4 className="mt-3">{item.name}</h4>
              {}
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
