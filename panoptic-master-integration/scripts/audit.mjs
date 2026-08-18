import fs from "node:fs";

const inv = JSON.parse(fs.readFileSync("state/component-inventory.json","utf8"));

const gaps = inv
  .filter(x => !x.discovered)
  .map(x => ({
    component: x.name,
    gap: "LOCAL_SOURCE_NOT_DISCOVERED",
    reality: "PROPOSED"
  }));

fs.writeFileSync(
  "state/evidence-gap-register.json",
  JSON.stringify(gaps, null, 2),
  "utf8"
);

const report = [
  "# PANOPTIC INTEGRATION STATUS",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Discovered locally: ${inv.filter(x => x.discovered).length}/${inv.length}`,
  "",
  "## Rule",
  "No component is promoted beyond evidence actually observed.",
  "",
  "## Missing local sources",
  ...gaps.map(g => `- ${g.component}: ${g.gap}`)
].join("\n");

fs.writeFileSync("reports/PANOPTIC-INTEGRATION-STATUS.md", report, "utf8");
console.log(report);