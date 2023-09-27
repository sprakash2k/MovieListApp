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
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const oldSrc = event.currentTarget.src;
    const newSrc =
      "https://test.create.diagnal.com/images/placeholder_for_missing_posters.png";
    if (
      oldSrc.includes(
        "https://test.create.diagnal.com/images/posterthatismissing.jpg"
      )
    ) {
      event.currentTarget.src = newSrc;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScrollToTopVisibility = () => {
    if (window.scrollY > 100) {
      setScrollToTopVisible(true);
    } else {
      setScrollToTopVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScrollToTopVisibility);
    return () => {
      window.removeEventListener("scroll", handleScrollToTopVisibility);
    };
  }, []);

  const toggleInputVisibility = () => {
    setInputVisible((prevVisible) => !prevVisible);
  };

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

  const loadInitialData = () => {
    fetchJsonData(
      `https://test.create.diagnal.com/data/page${currentPage}.json`
    );
    setCurrentPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

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

  const filteredItems = jsonData.page["content-items"].content.filter(
    (item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

  const noResultsFound = filteredItems.length === 0 && searchQuery.length > 0;

  return (
    <>
      <div className="diagnal">
        <nav className="navbar sticky-top">
          <div className="container-fluid d-flex">
            <div className="d-flex">
              <div className="naviarrow" onClick={clearSearchQuery}></div>
              <h3>Romantic Comedy</h3>
            </div>

            <div className="search-bar">
              <div className="searchicon" onClick={toggleInputVisibility} />
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
                  <span
                    className="close-icon"
                    onClick={clearSearchQuery}
                  ></span>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div
          className="items-loaded"
          onClick={scrollToTop}
          title="Scroll to Top"
        >
          #{jsonData.page["content-items"].content.length}
        </div>

        <div className="container-fluid mt-2">
          <h2>{jsonData.page.title}</h2>
          <div className="row p-cont">
            {filteredItems.map((item: any, index: number) => (
              <div className="col-sm-4 content" key={index}>
                <img
                  src={`https://test.create.diagnal.com/images/${item["poster-image"]}`}
                  alt={item.name}
                  onError={handleImageError}
                  className="missing-img"
                />
                <h4 className="mt-3">{item.name}</h4>
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
      </div>
    </>
  );
}

export default App;
