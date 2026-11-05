const tabs = [...document.querySelectorAll(".animal-tab")];
let animal = "chien";
const title = document.querySelector("#resultsTitle");
const search = document.querySelector("#search");
const count = document.querySelector("#resultCount");
const empty = document.querySelector("#emptyState");
const sizeSelect = document.querySelector("#size");
const sizeLabel = document.querySelector("#sizeField");
const sizeHelp = document.querySelector("#sizeHelp");
document.querySelector("#year").textContent = new Date().getFullYear();

function setAnimal(value) {
  animal = value;
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.animal === value));
  title.textContent = value === "chien" ? "Les croquettes pour chien" : "Les croquettes pour chat";
  search.placeholder = value === "chien" ? "Ex. : saumon, digestion sensible, marque…" : "Ex. : chat stérilisé, saumon, digestion…";
  count.textContent = "Catalogue en préparation";
  if (value === "chat") {
    sizeLabel.querySelector(".field-label");
    sizeSelect.innerHTML = '<option value="">Tous les gabarits</option><option value="Standard">Gabarit standard</option><option value="Grand">Grand chat (type Maine Coon)</option>';
    sizeHelp.textContent = "Le gabarit du chat est indicatif ; le poids idéal dépend notamment de sa morphologie.";
    sizeLabel.childNodes[0].textContent = "Gabarit";
  } else {
    sizeSelect.innerHTML = '<option value="">Toutes les tailles</option><option value="Petite">Petit · moins de 10 kg</option><option value="Moyenne">Moyen · 10 à 25 kg</option><option value="Grande">Grand · 25 à 45 kg</option><option value="Géante">Géant · plus de 45 kg</option>';
    sizeHelp.textContent = "Repère basé sur le poids adulte idéal.";
    sizeLabel.childNodes[0].textContent = "Taille / poids adulte";
  }
}
tabs.forEach(tab => tab.addEventListener("click", () => setAnimal(tab.dataset.animal)));
function runSearch() {
  const query = search.value.trim();
  const age = document.querySelector("#age").value;
  const size = sizeSelect.value;
  const need = document.querySelector("#need").value;
  const activeFilters = [age, size, need].filter(Boolean);
  count.textContent = query || activeFilters.length ? "Recherche prête — données à intégrer" : "Catalogue en préparation";
  empty.querySelector("h3").textContent = query || activeFilters.length ? "Votre recherche est prête à être connectée au catalogue" : "Un catalogue en préparation, avec du sérieux !";
  empty.querySelector("p").textContent = "Le catalogue de références vérifiées est la prochaine étape. Les résultats, les notes nutritionnelles et les prix marchands seront affichés uniquement lorsque leurs sources auront été contrôlées.";
}
document.querySelector("#searchBtn").addEventListener("click", runSearch);
search.addEventListener("keydown", event => { if (event.key === "Enter") runSearch(); });
document.querySelectorAll(".filter-row select").forEach(select => select.addEventListener("change", runSearch));
document.querySelectorAll("[data-jump-animal]").forEach(link => {
  link.addEventListener("click", () => setAnimal(link.dataset.jumpAnimal));
});
