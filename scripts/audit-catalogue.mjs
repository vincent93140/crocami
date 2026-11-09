import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const errors = [];
const warnings = [];
const context = { window: {}, console };
vm.createContext(context);

for (const file of ["fabricants.js", "catalogue.js", "references-complementaires.js", "marchands.js", "royalcanin.js", "royalcanin-complements.js", "complements-sources.js"]) {
  const source = fs.readFileSync(file, "utf8");
  try {
    new vm.Script(source, { filename: file });
    vm.runInContext(source, context, { filename: file, timeout: 5000 });
  } catch (error) {
    errors.push(`${file}: exécution impossible — ${error.message}`);
  }
}

const products = context.window.CROCamiCatalog;
const manufacturers = context.window.CROCamiManufacturerData || {};
if (!Array.isArray(products)) {
  errors.push("Le catalogue ne produit pas de tableau CROCamiCatalog.");
} else {
  const ids = new Map();
  const numericFields = [
    "formatKg", "prixSac", "prixKg", "proteines", "proteinesMS",
    "matieresGrasses", "fibres", "cendres", "humidite", "glucides",
    "calcium", "phosphore", "magnesium", "sodium", "potassium",
    "omega3", "omega6", "energie", "taurine", "epa", "dha"
  ];
  const percentageFields = [
    "proteines", "proteinesMS", "matieresGrasses", "fibres",
    "cendres", "humidite", "glucides", "calcium", "phosphore",
    "magnesium", "sodium", "potassium", "omega3", "omega6"
  ];
  const urlFields = [
    "sourceFabricant", "sourceDocumentFabricant", "sourceRevendeur",
    "sourceFiche", "sourceComplementaire", "urlVendeur", "imageProduit"
  ];

  if (products.length < 200) errors.push(`Catalogue anormalement réduit : ${products.length} références (minimum attendu : 200).`);

  for (const [index, p] of products.entries()) {
    const label = p?.id || `ligne ${index + 1}`;
    if (!p || typeof p !== "object" || Array.isArray(p)) {
      errors.push(`${label}: fiche produit invalide.`);
      continue;
    }
    for (const field of ["id", "espece", "marque", "recette", "age"]) {
      if (typeof p[field] !== "string" || !p[field].trim()) errors.push(`${label}: champ obligatoire ${field} absent ou vide.`);
    }
    if (p.id) {
      if (ids.has(p.id)) errors.push(`Identifiant dupliqué ${p.id} (fiches ${ids.get(p.id)} et ${index + 1}).`);
      else ids.set(p.id, index + 1);
    }
    if (!["chien", "chat"].includes(p.espece)) errors.push(`${label}: espèce invalide (${p.espece}).`);
    if (!Array.isArray(p.besoins) || p.besoins.some(x => typeof x !== "string" || !x.trim())) errors.push(`${label}: besoins doit être une liste de textes.`);

    for (const field of numericFields) {
      const value = p[field];
      if (value != null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
        errors.push(`${label}: valeur numérique invalide pour ${field} (${value}).`);
      }
    }
    for (const field of percentageFields) {
      if (typeof p[field] === "number" && p[field] > 100) errors.push(`${label}: ${field} dépasse 100 % (${p[field]}).`);
    }
    if (typeof p.energie === "number" && (p.energie < 1000 || p.energie > 10000)) {
      errors.push(`${label}: énergie hors plage plausible (${p.energie} kcal/kg).`);
    }
    if (typeof p.prixSac === "number" && typeof p.formatKg === "number" && p.formatKg > 0 && typeof p.prixKg === "number") {
      const expected = p.prixSac / p.formatKg;
      if (Math.abs(expected - p.prixKg) > Math.max(0.12, expected * 0.025)) {
        warnings.push(`${label}: prix/kg (${p.prixKg}) différent du calcul prix sac/format (${expected.toFixed(2)}).`);
      }
    }
    for (const field of urlFields) {
      if (p[field] == null || p[field] === "") continue;
      try {
        if (field === "imageProduit" && !/^https?:\/\//i.test(p[field])) {
          const local = path.resolve(p[field]);
          if (!local.startsWith(path.resolve("images") + path.sep) || !fs.existsSync(local) || !fs.statSync(local).isFile()) throw new Error("Photo locale absente ou hors du répertoire images");
          continue;
        }
        const url = new URL(p[field]);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocole non autorisé");
        if (field === "imageProduit" && url.protocol !== "https:") warnings.push(`${label}: image non sécurisée (HTTP).`);
      } catch {
        errors.push(`${label}: URL invalide dans ${field}.`);
      }
    }
    if (p.dateVerificationFabricant != null && !/^\d{4}-\d{2}-\d{2}$/.test(p.dateVerificationFabricant)) {
      errors.push(`${label}: dateVerificationFabricant doit être au format AAAA-MM-JJ.`);
    }
  }

  for (const id of Object.keys(manufacturers)) {
    if (!ids.has(id) && !context.window.CROCamiProductAliases?.[id]) errors.push(`Données fabricant orphelines : aucun produit catalogue avec l'identifiant ${id}.`);
  }

  const species = products.reduce((acc, p) => {
    if (p?.espece) acc[p.espece] = (acc[p.espece] || 0) + 1;
    return acc;
  }, {});
  const missing = products.filter(p => !p?.imageProduit).length;
  console.log(JSON.stringify({
    totalProducts: products.length,
    uniqueIds: ids.size,
    bySpecies: species,
    manufacturerRecords: Object.keys(manufacturers).length,
    productsWithoutImage: missing,
    errors: errors.length,
    warnings: warnings.length,
    warningExamples: warnings.slice(0, 20)
  }, null, 2));
}

if (errors.length) {
  console.error("\nÉCHECS DU CONTRÔLE :");
  for (const error of errors) console.error(" - " + error);
  process.exitCode = 1;
} else {
  console.log("Contrôle structurel du catalogue : OK.");
}
