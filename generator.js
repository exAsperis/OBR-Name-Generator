export const DEFAULT_PARTS = Object.freeze({
  prefixes: ["Aer", "Ash", "Bel", "Cor", "Dae", "El", "Fen", "Gal", "Iri", "Kael", "Lor", "Mor", "Ny", "Or", "Riv", "Syl", "Thal", "Vael", "Wyn", "Zor"],
  stems: ["adin", "ael", "ara", "bryn", "dor", "drin", "eth", "fira", "gorn", "ian", "is", "orin", "rath", "ric", "riel", "ryn", "ther", "uin", "var", "wen"],
  suffixes: ["a", "ae", "an", "ar", "as", "en", "eth", "ia", "iel", "in", "ion", "is", "on", "or", "ra", "ric", "us", "yn"],
  names: ["Arden", "Bramble", "Caspian", "Elowen", "Garrick", "Isolde", "Juniper", "Lucan", "Mirelle", "Nim", "Orla", "Peregrin", "Rowan", "Seraphine", "Tamsin", "Vesper"],
  epithets: ["the Ashen", "Brightblade", "of the Hollow", "the Moon-Touched", "Stormborn", "the Quiet", "of Seven Roads", "the Unforgotten", "Wildheart"]
});

export function cleanParts(parts) {
  const out = {};
  for (const key of Object.keys(DEFAULT_PARTS)) {
    const values = Array.isArray(parts?.[key]) ? parts[key] : [];
    out[key] = [...new Set(values.map((v) => String(v).trim()).filter(Boolean))];
  }
  return out;
}

function pick(values, random) {
  return values[Math.floor(random() * values.length)];
}

function assembled(parts, random) {
  const shapes = [
    ["prefixes", "stems"],
    ["prefixes", "suffixes"],
    ["prefixes", "stems", "suffixes"]
  ].filter((shape) => shape.every((key) => parts[key].length));
  if (!shapes.length) return "";
  const result = pick(shapes, random).map((key) => pick(parts[key], random)).join("");
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}

export function generateName(rawParts, options = {}, random = Math.random) {
  const parts = cleanParts(rawParts);
  const canAssemble = parts.prefixes.length && (parts.stems.length || parts.suffixes.length);
  const canUseGiven = parts.names.length > 0;
  let style = options.style || "mixed";
  if (style === "mixed") style = canAssemble && canUseGiven ? (random() < 0.7 ? "assembled" : "given") : canAssemble ? "assembled" : "given";
  let name = style === "given" && canUseGiven ? pick(parts.names, random) : assembled(parts, random);
  if (!name && canUseGiven) name = pick(parts.names, random);
  if (!name) throw new Error("Add a complete name, or add a prefix and a stem or suffix.");
  if (options.withTitle && parts.epithets.length) name += ` ${pick(parts.epithets, random)}`;
  return name;
}
