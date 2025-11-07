// --- Get Elements ---
const searchbtn = document.getElementById("searchbtn");
const clearbtn = document.getElementById("clearbtn");
const result = document.getElementById("resultContainer");
const mydiv = document.getElementById("dropdown");
const close = document.getElementById("close-btn");
const query = document.getElementById("searchinput");

// --- Clear Search ---
const clearsearch = () => {
  query.value = "";
  mydiv.style.display = "none";
  result.innerHTML = "";
  console.log("Cleared search");
};
clearbtn.addEventListener("click", clearsearch);

// --- Close Dropdown ---
const closeDropdown = () => {
  mydiv.style.display = "none";
  query.value = "";
  result.innerHTML = "";
};
close.addEventListener("click", closeDropdown);

// --- Display Error Message ---
const searchError = () => {
  mydiv.style.display = "block";
  result.innerHTML = `<p class="notfound">Sorry, we can't find your search.</p>`;
};

// --- Helper: render a list of recommendation items that have imageUrl ---
const renderImageItems = (items) => {
  return items
    .map(
      (item) => `
    <div class="recommendation">
      <h3 class="title">${item.name}</h3>
      ${item.imageUrl ? `<img class="search-img" src="${item.imageUrl}" alt="${item.name}">` : ""}
      <p class="description">${item.description || ""}</p>
    </div>
  `
    )
    .join("");
};

// --- Fetch Data and Handle Search ---
fetch("travelrecommendation.json")
  .then((res) => res.json())
  .then((data) => {
    const search = () => {
      const searchQuery = query.value.trim().toLowerCase();
      let html = "";

      // --- Beaches: show up to 2 beach images ---
      if (searchQuery.includes("beach")) {
        const beaches = data.beaches.slice(0, 2);
        mydiv.style.display = "block";
        result.innerHTML = renderImageItems(beaches);
        return;
      }

      // --- Temples: show up to 2 temple images ---
      if (searchQuery.includes("temple")) {
        const temples = data.temples.slice(0, 2);
        mydiv.style.display = "block";
        result.innerHTML = renderImageItems(temples);
        return;
      }

      // --- Generic "country" keyword: show 2 countries; each with up to 2 city images ---
      if (searchQuery.includes("country")) {
        const countries = data.countries.slice(0, 2); // first two countries
        if (countries.length === 0) {
          searchError();
          return;
        }

        mydiv.style.display = "block";
        html = countries
          .map((c) => {
            const cityItems = (c.cities || []).slice(0, 2); // up to 2 city images per country
            const citiesHtml = cityItems
              .map(
                (city) => `
                  <div class="country-city">
                    <img class="search-img" src="${city.imageUrl}" alt="${city.name}">
                    <p class="city-name">${city.name}</p>
                  </div>
                `
              )
              .join("");

            return `
              <div class="country-block">
                <h3 class="title country-title">${c.name}</h3>
                <div class="country-cities">${citiesHtml}</div>
              </div>
            `;
          })
          .join("");

        result.innerHTML = html;
        return;
      }

      // --- Specific Country Name: find country and show up to 2 city images ---
      const country = data.countries.find((c) =>
        c.name.toLowerCase().includes(searchQuery)
      );
      if (country) {
        const cityItems = (country.cities || []).slice(0, 2);
        if (cityItems.length > 0) {
          mydiv.style.display = "block";
          result.innerHTML = `
            <div class="country-block">
              <h3 class="title country-title">${country.name}</h3>
              <div class="country-cities">
                ${cityItems
                  .map(
                    (city) => `
                      <div class="country-city">
                        <img class="search-img" src="${city.imageUrl}" alt="${city.name}">
                        <p class="city-name">${city.name}</p>
                        <p class="description">${city.description || ""}</p>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          `;
        } else {
          // country exists but has no city images
          mydiv.style.display = "block";
          result.innerHTML = `<div class="country-block"><h3 class="title">${country.name}</h3><p>No city images available.</p></div>`;
        }
        return;
      }

      // --- City name search: search cities across countries ---
      let found = false;
      const cityMatches = [];
      data.countries.forEach((c) => {
        (c.cities || []).forEach((city) => {
          if (city.name.toLowerCase().includes(searchQuery)) {
            cityMatches.push(city);
            found = true;
          }
        });
      });
      if (cityMatches.length > 0) {
        mydiv.style.display = "block";
        result.innerHTML = renderImageItems(cityMatches.slice(0, 2));
        return;
      }

      // --- fallback: not found ---
      searchError();
    };

    // click and Enter-key support
    searchbtn.addEventListener("click", search);
    query.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        search();
      }
    });
  })
  .catch((err) => {
    console.error("Failed to load data:", err);
    mydiv.style.display = "block";
    result.innerHTML = `<p class="notfound">Error loading travel data. Please try again later.</p>`;
  });
