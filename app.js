const tabs = [...document.querySelectorAll(".animal-tab")];
let animal = "chien";
const title = document.querySelector("#resultsTitle");
const search = document.querySelector("#search");
const count = document.querySelector("#resultCount");
const empty = document.querySelector("#emptyState");
document.querySelector("#year").textContent = new Date().getFullYear();

function setAnimal(value) {
  animal = value;
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.animal === value));
  title.textContent = value === "chien" ? "Les croquettes pour chien" : "Les croquettes pour chat";
  search.placeholder = value === "chien" ? "Ex. : croquettes saumon, digestion sensible…" : "Ex. : croquettes chat stérilisé, sans céréales…";
  count.textContent = "Catalogue en préparation";
}
tabs.forEach(tab => tab.addEventListener("click", () => setAnimal(tab.dataset.animal)));
function runSearch() {
  const query = search.value.trim();
  const age = document.querySelector("#age").value;
  const size = document.querySelector("#size").value;
  const need = document.querySelector("#need").value;
  const activeFilters = [age, size, need].filter(Boolean);
  count.textContent = query || activeFilters.length ? "Recherche prête — données à intégrer" : "Catalogue en préparation";
  empty.querySelector("h3").textContent = query || activeFilters.length ? "Votre recherche est prête à être connectée au catalogue" : "Notre catalogue se remplit !";
  empty.querySelector("p").textContent = "Le catalogue de références vérifiées est la prochaine étape. Les résultats, les notes nutritionnelles et les prix marchands seront affichés uniquement lorsque leurs sources auront été contrôlées.";
}
document.querySelector("#searchBtn").addEventListener("click", runSearch);
search.addEventListener("keydown", event => { if (event.key === "Enter") runSearch(); });
document.querySelectorAll(".filter-row select").forEach(select => select.addEventListener("change", runSearch));