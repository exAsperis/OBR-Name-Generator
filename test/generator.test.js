import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { cleanParts, generateName } from "../generator.js";

test("cleans, trims, and de-duplicates lists", () => {
  const result = cleanParts({ prefixes: [" Aer ", "", "Aer"] });
  assert.deepEqual(result.prefixes, ["Aer"]);
  assert.deepEqual(result.stems, []);
});

test("assembles a deterministic name", () => {
  const parts = { prefixes: ["Aer"], stems: ["dor"], suffixes: [], names: [], epithets: [] };
  assert.equal(generateName(parts, { style: "assembled" }, () => 0), "Aerdor");
});

test("uses complete names and optional titles", () => {
  const parts = { prefixes: [], stems: [], suffixes: [], names: ["Elowen"], epithets: ["the Quiet"] };
  assert.equal(generateName(parts, { style: "given", withTitle: true }, () => 0), "Elowen the Quiet");
});

test("explains when the lists cannot produce a name", () => {
  assert.throws(() => generateName({}, {}, () => 0), /Add a complete name/);
});

test("ships a valid Owlbear Rodeo manifest", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));
  assert.equal(manifest.manifest_version, 1);
  assert.equal(manifest.version, "1.0.2");
  assert.equal(manifest.action.popover, "https://exasperis.github.io/OBR-Name-Generator/index.html");
});
