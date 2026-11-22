(() => {
  "use strict";

  const storageKey = "kansatsu-garden.observations.v1";
  const dayMillis = 86400000;
  let selectedId = "";
  let comparisonId = "";
  let metric = "height";
  const app = () => window.GardenApp;
  const esc = value => app().escape(String(value ?? ""));
  const icon = (name, size = 18) => app().icon(name, size);
  const kinds = () => window.GardenData.species;
  const kindName = id => kinds().find(kind => kind.id === id)?.name || "植物";
  const newId = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);

  function today() {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  function dateLabel(value, year = false) {
    if (!value) return "記録なし";
    const [y, m, d] = value.split("-").map(Number);
    return (year ? y + "年" : "") + m + "月" + d + "日";
  }

  function dateNumber(value) {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, m - 1, d) / dayMillis;
  }

  function read() {
    try {
      const text = localStorage.getItem(storageKey);
      if (!text) return {plants: [], entries: []};
      const data = JSON.parse(text);
      if (Array.isArray(data.plants) && Array.isArray(data.entries)) return data;
    } catch {
      // A page can still be viewed when browser storage is unavailable.
    }
    return {plants: [], entries: []};
  }

  const newest = (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id);

  function summaries(data) {
    return data.plants.map(plant => {
      const records = data.entries.filter(entry => entry.plantId === plant.id).sort(newest);
      const last = records[0];
      return {...plant, height: last?.height ?? null, leaves: last?.leaves ?? null,
        count: records.length, date: last?.date ?? null, photo: last?.photo || ""};
    });
  }

  function getPlants() {
    return summaries(read());
  }

  function getEntries() {
    const data = read();
    const byId = new Map(data.plants.map(plant => [plant.id, plant]));
    return data.entries.filter(entry => byId.has(entry.plantId)).sort(newest).map(entry => {
      const plant = byId.get(entry.plantId);
      return {...entry, name: plant.name, species: plant.species, speciesName: plant.speciesName || kindName(plant.species)};
    });
  }

  function save(data, errorBox) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch {
      errorBox.textContent = "この端末に保存できませんでした。ブラウザーの保存設定を確認するか、写真をはずして、もう一度保存してください。";
      return false;
    }
  }

  function refresh(message) {
    app().closeModal();
    app().refresh();
    app().toast(message);
  }

  function plantFields() {
    return `<fieldset class="ob-fields ob-plant-fields"><legend>育てる植物</legend>
      <div class="ob-two">
        <label>植物の種類<select name="species">${kinds().map(kind => `<option value="${esc(kind.id)}">${esc(kind.name)}</option>`).join("")}<option value="other">そのほかの植物</option></select></label>
        <label>鉢の名前 <small>（自由）</small><input name="nickname" maxlength="30" placeholder="例　ひまわり１号"></label>
      </div>
      <label class="ob-custom-name" hidden>植物の名前<input name="speciesName" maxlength="35" placeholder="例　ミニトマト" disabled></label>
      <div class="ob-two">
        <label>日当たり<select name="light"><option>日なた</option><option>日かげ</option></select></label>
        <label>肥料<select name="fertilizer"><option value="なし">肥料なし</option><option value="あり">肥料あり</option></select></label>
      </div>
    </fieldset>`;
  }

  function watchSpecies(form) {
    const label = form.querySelector(".ob-custom-name");
    const input = form.elements.speciesName;
    form.elements.species.addEventListener("change", () => {
      const custom = form.elements.species.value === "other";
      label.hidden = input.disabled = !custom;
      input.required = custom;
      if (custom) input.focus();
    });
    input.addEventListener("input", () => input.setCustomValidity(input.value.trim() ? "" : "植物の名前を入力してください。"));
  }

  function makePlant(form, data) {
    const controls = form.elements;
    const species = controls.species.value;
    const base = species === "other" ? controls.speciesName.value.trim().normalize("NFKC") : kindName(species);
    let name = controls.nickname.value.trim() || base;
    if (!controls.nickname.value.trim() && data.plants.some(plant => plant.name === name)) {
      let number = 2;
      while (data.plants.some(plant => plant.name === base + number + "号")) number++;
      name = base + number + "号";
    }
    return {id: newId(), name, species, speciesName: base, light: controls.light.value, fertilizer: controls.fertilizer.value};
  }

  function openNewPlant() {
    const content = app().modal("観察する鉢をふやす", `<form class="ob-form">${plantFields()}
      <p class="ob-error" role="alert"></p><button class="ob-primary" type="submit">${icon("plus")}鉢を登録する</button></form>`);
    const form = content.querySelector("form");
    watchSpecies(form);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = read();
      const plant = makePlant(form, data);
      data.plants.push(plant);
      if (!save(data, form.querySelector(".ob-error"))) return;
      selectedId = plant.id;
      comparisonId = "";
      refresh("「" + plant.name + "」を庭に加えました");
    });
  }

  async function shrinkPhoto(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      const scale = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.72);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function openRecord(plantId, entryId) {
    const data = read();
    const entry = data.entries.find(row => row.id === entryId);
    const id = entry?.plantId || plantId || selectedId;
    const currentPlant = data.plants.find(plant => plant.id === id) || data.plants[0];
    const plantSelector = data.plants.length ? `<label>観察した鉢<select name="plantId"${entry ? " disabled" : ""}>
      ${data.plants.map(plant => `<option value="${esc(plant.id)}"${plant.id === currentPlant.id ? " selected" : ""}>${esc(plant.name)}（${esc(plant.light)}・肥料${esc(plant.fertilizer)}）</option>`).join("")}
      <option value="new">＋ 新しい鉢を登録</option></select></label>` : "";
    const content = app().modal(entry ? "観察記録を編集" : "観察を記録する", `<form class="ob-form">
      ${plantSelector}${plantFields()}
      <label>観察した日<input type="date" name="date" required max="${today()}" value="${entry?.date || today()}"></label>
      <div class="ob-two ob-measure-inputs">
        <label>草たけ <span class="ob-with-unit"><input name="height" type="number" min="0" max="100000" step="0.1" inputmode="decimal" required placeholder="0.0"><span>cm</span></span></label>
        <label>葉の数 <span class="ob-with-unit"><input name="leaves" type="number" min="0" max="100000" step="1" inputmode="numeric" required placeholder="0"><span>枚</span></span></label>
      </div>
      <label>気づいたこと <small>（自由）</small><textarea name="note" maxlength="500" rows="2" placeholder="葉の形や色、昨日とのちがいは？"></textarea></label>
      <div class="ob-photo-row"><label class="ob-upload">${icon("camera")} 写真を選ぶ<input type="file" accept="image/*" name="upload"></label><span class="ob-upload-info">写真は１枚まで</span><button type="button" class="ob-text-button" data-remove-photo hidden>写真をはずす</button></div>
      <img class="ob-preview" alt="観察の写真" hidden>
      <p class="ob-same-date" aria-live="polite"></p><p class="ob-error" role="alert"></p>
      <button type="submit" class="ob-primary">${icon("check")}記録を保存する</button>
    </form>`);
    const form = content.querySelector("form");
    watchSpecies(form);
    const controls = form.elements;
    const newFields = form.querySelector(".ob-plant-fields");
    const preview = form.querySelector(".ob-preview");
    const remove = form.querySelector("[data-remove-photo]");
    const error = form.querySelector(".ob-error");
    const notice = form.querySelector(".ob-same-date");
    const submit = form.querySelector('[type="submit"]');
    let photo = "";
    let activeEntry = entry;
    let photoRequest = 0;

    function showPhoto(value) {
      photo = value || "";
      preview.hidden = remove.hidden = !photo;
      if (photo) preview.src = photo;
      else preview.removeAttribute("src");
    }

    function syncEntry() {
      const addingPlant = !controls.plantId || controls.plantId.value === "new";
      newFields.hidden = newFields.disabled = !addingPlant;
      activeEntry = entry || data.entries.find(row => row.plantId === controls.plantId?.value && row.date === controls.date.value);
      notice.textContent = !entry && activeEntry ? "この日の記録があります。保存すると、その記録が更新されます。" : "";
      photoRequest++;
      submit.disabled = false;
      controls.upload.value = "";
      controls.height.value = activeEntry?.height ?? "";
      controls.leaves.value = activeEntry?.leaves ?? "";
      controls.note.value = activeEntry?.note || "";
      showPhoto(activeEntry?.photo);
    }
    syncEntry();
    controls.plantId?.addEventListener("change", syncEntry);
    // A new date with no existing record retains measurements already entered.
    controls.date.addEventListener("change", () => {
      if (entry) return;
      const match = data.entries.find(row => row.plantId === controls.plantId?.value && row.date === controls.date.value);
      if (match || activeEntry) syncEntry();
    });

    controls.upload.addEventListener("change", async () => {
      const file = controls.upload.files[0];
      if (!file) return;
      const request = ++photoRequest;
      submit.disabled = true;
      error.textContent = "";
      try {
        const compressed = await shrinkPhoto(file);
        if (request === photoRequest) showPhoto(compressed);
      } catch {
        if (request === photoRequest) error.textContent = "写真を読み込めませんでした。JPEGやPNGの写真を選び直してください。";
      } finally {
        if (request === photoRequest) submit.disabled = false;
      }
    });
    remove.addEventListener("click", () => {
      photoRequest++;
      showPhoto("");
      controls.upload.value = "";
      submit.disabled = false;
      error.textContent = "";
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (submit.disabled) return;
      const fresh = read();
      const addingPlant = !controls.plantId || controls.plantId.value === "new";
      const plant = addingPlant ? makePlant(form, fresh) : fresh.plants.find(item => item.id === controls.plantId.value);
      if (!plant) {
        error.textContent = "鉢が見つかりません。いちど閉じて、鉢を選び直してください。";
        return;
      }
      const date = controls.date.value;
      const existing = fresh.entries.find(row => row.plantId === plant.id && row.date === date);
      if (existing && existing.id !== activeEntry?.id) {
        error.textContent = "同じ鉢の同じ日に、別の記録があります。その記録を開いて編集してください。";
        return;
      }
      if (addingPlant) fresh.plants.push(plant);
      const row = {id: entry?.id || existing?.id || newId(), plantId: plant.id, date,
        height: Number(controls.height.value), leaves: Number(controls.leaves.value), note: controls.note.value.trim(), photo};
      const index = fresh.entries.findIndex(item => item.id === row.id);
      if (index < 0) fresh.entries.push(row);
      else fresh.entries[index] = row;
      if (!save(fresh, error)) return;
      if (selectedId !== plant.id) comparisonId = "";
      selectedId = plant.id;
      refresh("「" + plant.name + "」の観察を保存しました");
    });
  }

  function graph(series) {
    const unit = metric === "height" ? "cm" : "枚";
    const sets = series.map(s => s.entries.map(row => ({day: dateNumber(row.date), date: row.date, value: row[metric]})).sort((a, b) => a.day - b.day));
    const points = sets.flat();
    if (!points.length) return `<div class="ob-no-graph">${icon("sprout", 34)}<p>最初の記録をつけると、ここにグラフができます。</p></div>`;
    const days = [...new Set(points.map(p => p.day))].sort((a, b) => a - b);
    const first = days[0], last = days[days.length - 1];
    const biggest = Math.max(1, ...points.map(p => p.value));
    const multiple = 10 ** Math.floor(Math.log10(biggest / 4));
    let step = [1, 2, 2.5, 5, 10].find(n => n * multiple >= biggest / 4) * multiple;
    if (metric === "leaves") step = Math.max(1, Math.ceil(step));
    const ticks = Math.ceil(biggest / step);
    const x = day => first === last ? 270 : 45 + 447 * (day - first) / (last - first);
    const y = value => 164 - value / (step * ticks) * 142;
    const scale = Array.from({length: ticks + 1}, (_, i) => {
      const value = +(step * i).toFixed(2);
      return `<line x1="45" x2="492" y1="${y(value)}" y2="${y(value)}" class="ob-gridline"/><text x="35" y="${y(value) + 4}" text-anchor="end">${value}</text>`;
    }).join("");
    const labelDays = days.filter((day, i) => day === first || day === last || (day - first >= (last - first) * 0.18 && last - day >= (last - first) * 0.18 && i === Math.floor(days.length / 2)));
    const dates = labelDays.map(day => {
      const date = new Date(day * dayMillis);
      return `<text x="${x(day)}" y="188" text-anchor="middle">${date.getUTCMonth() + 1}/${date.getUTCDate()}</text>`;
    }).join("");
    const lines = sets.map((points, index) => {
      const style = index ? "ob-series ob-series-b" : "ob-series";
      return `<g class="${style}"><polyline points="${points.map(p => x(p.day) + "," + y(p.value)).join(" ")}"/>${points.map(p => `<circle cx="${x(p.day)}" cy="${y(p.value)}" r="${index ? 3 : 4.5}"><title>${esc(series[index].plant.name)}　${dateLabel(p.date, true)}　${p.value} ${unit}</title></circle>`).join("")}</g>`;
    }).join("");
    let table = "";
    if (series.length > 1) {
      const values = sets.map(set => new Map(set.map(point => [point.day, point])));
      const rows = days.map(day => {
        const cells = values.map(set => set.get(day));
        const date = cells.find(Boolean).date;
        return `<tr><th scope="row">${dateLabel(date, true)}</th>${cells.map(point => '<td>' + (point ? point.value + " " + unit : "記録なし") + '</td>').join("")}</tr>`;
      }).join("");
      table = `<details class="ob-values"><summary>日ごとの数値をくらべる</summary><table><thead><tr><th scope="col">観察日</th>${series.map(s => `<th scope="col">${esc(s.plant.name)}<small>${conditions(s.plant)}</small></th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></details>`;
    }
    return `<svg viewBox="0 0 520 200" class="ob-chart" role="img" aria-label="${esc(series.map(s => s.plant.name).join("と"))}の${metric === "height" ? "草たけ" : "葉の数"}の変化"><text x="10" y="13">${unit}</text>${scale}${lines}${dates}</svg>${table}`;
  }

  function conditions(plant) {
    return esc(plant.light) + "・肥料" + esc(plant.fertilizer);
  }

  function shell(plant) {
    return `<div class="ob-titlebar"><div><h1>かんさつノート</h1><p>本物の植物の育ち方を、記録してくらべよう。</p></div>
      <button class="ob-primary" type="button" data-ob="record">${icon("plus")}観察を記録</button></div>
      ${plant ? "" : `<section class="ob-panel ob-welcome"><div class="ob-welcome-art">${app().art("sunflower", 2)}</div>
        <div><h2>最初の観察をはじめよう</h2><p>育てている植物の草たけをはかって、葉の数をかぞえてみよう。<br>日当たりや肥料のちがう鉢も、ひとつずつ登録できるよ。</p>
        <button type="button" class="ob-text-button" data-ob="record">最初の記録をつける ${icon("arrow-right", 16)}</button></div></section>`}`;
  }

  function render(root) {
    const data = read();
    const plants = summaries(data);
    const plant = plants.find(p => p.id === selectedId) || plants[0];
    let html = shell(plant);
    if (plant) {
      selectedId = plant.id;
      const records = data.entries.filter(entry => entry.plantId === plant.id).sort(newest);
      const peers = plants.filter(p => p.id !== plant.id && p.species === plant.species && (p.species !== "other" || p.speciesName === plant.speciesName));
      const peer = peers.find(p => p.id === comparisonId);
      comparisonId = peer?.id || "";
      const series = [{plant, entries: records}];
      if (peer) series.push({plant: peer, entries: data.entries.filter(entry => entry.plantId === peer.id)});
      const last = records[0];
      const mapLink = window.GardenMaps.placesFor(plant.species).map(({map,href}) =>
        '<a class="ob-map-link" href="' + esc(href) + '">' + icon('globe',15) + ' この植物を' + map.name + 'で見る</a>'
      ).join('');
      html += `<section class="ob-potbar"><label>${icon("sprout", 20)} 観察する鉢<select data-control="plant">${plants.map(p => `<option value="${esc(p.id)}"${p.id === plant.id ? " selected" : ""}>${esc(p.name)}（${conditions(p)}）</option>`).join("")}</select></label><button type="button" class="ob-outline" data-ob="plant">${icon("plus", 15)}鉢をふやす</button></section>
      <div class="ob-dashboard"><section class="ob-panel ob-graph-panel"><div class="ob-section-head"><h2>育ち方グラフ</h2>
      <div class="ob-segment" role="group" aria-label="グラフに表示するもの">${[["height", "草たけ"], ["leaves", "葉の数"]].map(([key, label]) => `<button type="button" data-metric="${key}" aria-pressed="${metric === key}">${label}</button>`).join("")}</div></div>
      <div class="ob-chart-legend">${series.map((s, i) => `<span><i class="ob-line ob-line-${i}"></i>${esc(s.plant.name)} <small>${conditions(s.plant)}</small></span>`).join("")}</div>
      ${graph(series)}
      ${peers.length ? `<label class="ob-compare">条件をくらべる<select data-control="peer"><option value="">くらべる鉢を選ぶ</option>${peers.map(p => `<option value="${esc(p.id)}"${p.id === comparisonId ? " selected" : ""}>${esc(p.name)}（${conditions(p)}）</option>`).join("")}</select></label>${peer && !series[1].entries.length ? '<p class="ob-muted">くらべる鉢には、まだ記録がありません。</p>' : ""}` : `<p class="ob-tip">同じ種類の鉢をふやすと、条件による育ち方のちがいをくらべられます。</p>`}</section>
      <section class="ob-panel ob-latest"><h2>いまのすがた</h2><div class="ob-specimen">${last?.photo ? `<img src="${esc(last.photo)}" alt="${esc(plant.name)}の観察写真">` : app().measuredPlant(plant, app().measurementScale(plants))}</div>
        <h3>${esc(plant.name)}</h3><p class="ob-muted">${conditions(plant)}</p><dl class="ob-readout"><div><dt>草たけ</dt><dd>${last?.height ?? "－"} <small>cm</small></dd></div><div><dt>葉の数</dt><dd>${last?.leaves ?? "－"} <small>枚</small></dd></div></dl>${mapLink}</section></div>
      <section class="ob-panel ob-history"><div class="ob-section-head"><h2>観察の記録</h2><span>${records.length} 件</span></div>${records.length ? records.map(row => `<article class="ob-entry">
        <div class="ob-entry-day"><span>${esc(row.date.slice(0, 4))}</span><strong>${dateLabel(row.date)}</strong></div>
        ${row.photo ? `<button class="ob-thumb" type="button" data-photo="${esc(row.id)}" aria-label="${dateLabel(row.date)}の写真をひらく"><img src="${esc(row.photo)}" alt="" loading="lazy"></button>` : ""}
        <div class="ob-entry-text"><strong>草たけ ${row.height} cm <em>／</em> 葉の数 ${row.leaves} 枚</strong>${row.note ? `<p>${esc(row.note)}</p>` : ""}</div>
        <button type="button" class="ob-text-button" data-edit="${esc(row.id)}" aria-label="${dateLabel(row.date)}の記録を編集">編集</button>
      </article>`).join("") : '<p class="ob-muted">まだ観察の記録がありません。</p>'}</section>`;
    }
    root.innerHTML = '<div class="ob-page">' + html + '</div>';
    root.querySelectorAll('[data-ob="record"]').forEach(button => button.addEventListener("click", () => openRecord(plant?.id)));
    root.querySelector('[data-ob="plant"]')?.addEventListener("click", openNewPlant);
    root.querySelector('[data-control="plant"]')?.addEventListener("change", event => {
      selectedId = event.target.value;
      comparisonId = "";
      render(root);
      root.querySelector('[data-control="plant"]').focus({preventScroll: true});
    });
    root.querySelector('[data-control="peer"]')?.addEventListener("change", event => {
      comparisonId = event.target.value;
      render(root);
      root.querySelector('[data-control="peer"]').focus({preventScroll: true});
    });
    root.querySelectorAll("[data-metric]").forEach(button => button.addEventListener("click", () => {
      metric = button.dataset.metric;
      render(root);
      root.querySelector('[data-metric="' + metric + '"]').focus({preventScroll: true});
    }));
    root.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => openRecord(plant.id, button.dataset.edit)));
    root.querySelectorAll("[data-photo]").forEach(button => button.addEventListener("click", () => {
      const row = data.entries.find(item => item.id === button.dataset.photo);
      app().modal(plant.name + "の観察写真", `<figure class="ob-photo-detail"><img src="${esc(row.photo)}" alt="${esc(plant.name)}の観察写真"><figcaption>${dateLabel(row.date, true)}　草たけ ${row.height} cm・葉の数 ${row.leaves} 枚${row.note ? `<p>${esc(row.note)}</p>` : ""}</figcaption></figure>`);
    }));
  }

  window.GardenObservations = {getPlants, getEntries, render, openNewPlant, openRecord};
})();
