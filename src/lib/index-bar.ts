export function mountIndexBar(
  root: HTMLElement,
  rows: HTMLElement[],
  jumpTo: (row: HTMLElement) => void,
) {
  const bar = root.querySelector<HTMLElement>("[data-bar]")!;
  const search = bar.querySelector<HTMLInputElement>("[data-search-input]")!;
  const count = bar.querySelector<HTMLElement>("[data-count]")!;
  bar.hidden = false;

  const filter = () => {
    const query = search.value.trim().toLowerCase();
    let matches = 0;
    for (const row of rows) {
      row.hidden = !row.dataset.search!.includes(query);
      if (!row.hidden) matches++;
    }
    count.textContent = query
      ? `${matches} ${matches === 1 ? "match" : "matches"}`
      : "";
  };
  search.addEventListener("input", filter);
  search.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    search.value = "";
    filter();
    search.blur();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey) return;
    if ((event.target as Element).closest("input, textarea")) return;
    event.preventDefault();
    search.focus();
  });

  bar.querySelector("[data-random]")!.addEventListener("click", () => {
    const visible = rows.filter((row) => !row.hidden);
    if (visible.length)
      jumpTo(visible[Math.floor(Math.random() * visible.length)]);
  });
}
