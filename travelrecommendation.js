// --- Get Elements ---
let searchbtn = document.getElementById("searchbtn");
let clearbtn = document.getElementById("clearbtn");
let result = document.getElementById("resultContainer");
let mydiv = document.getElementById("dropdown");
let close = document.getElementById("close-btn");
let query = document.getElementById("searchinput");

// --- Clear Search ---
const clearsearch = () => {
  query.value = "";
  mydiv.style.display = "none";
  console.log("Cleared search");
};

clearbtn.addEventListener("click", clearsearch);

// --- Close Dropdown ---
const closeDropdown = () => {
  mydiv.style.display = "none";
  query.value = "";
};

close.addEventListener("click", closeDropdown);

// --- Display Error Message ---
const searchError = () => {
  mydiv.style.display = "block";
  result.innerHTML = `<p class="notfound">Sorry, we can't find your search.</p>`;
};

// --- Fetch Data and Handle Search ---
fetch("travelrecommendation.json")
  .then((res) => res.json())
  .then((data) => {
    const search = () => {
      const searchQuery = query.value.trim().toLowerCase();
      let matches = [];

      // --- Beaches ---
      if (searchQuery.includes("beach")) {
        matches = data.beaches.slice(0, 2);
      }

      // --- Temples ---
      else if (searchQuery.includes("temple")) {
        matches = data.temples.slice(0, 2);
      }

      // --- Country ---
      else {
        const country = data.countries.find((c) =>
          c.name.toLowerCase().includes(searchQuery)
        );
        if (country) {
          matches = country.cities.slice(0, 2);
        }
      }

      // --- Show Results ---
      if (matches.length > 0) {
        mydiv.style.display = "block";
        result.innerHTML = matches
          .map(
            (item) => `
              <div class="recommendation">
                <h3 class="title">${item.name}</h3>
                <img class="search-img" src="${item.imageUrl}" alt="${item.name}">
                <p class="description">${item.description}</p>
              </div>
            `
          )
          .join("");
      } else {
        searchError();
      }
    };

    searchbtn.addEventListener("click", search);
  })
  .catch((err) => {
    console.error("Failed to load data:", err);
    result.innerHTML = `<p class="notfound">Error loading travel data. Please try again later.</p>`;
  });
