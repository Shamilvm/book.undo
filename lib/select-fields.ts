function closeSelect(field: HTMLElement) {
  field.classList.remove("is-open");
  field.querySelector<HTMLButtonElement>(".select-trigger")?.setAttribute(
    "aria-expanded",
    "false",
  );
}

function closeAllSelects(except?: HTMLElement) {
  document.querySelectorAll<HTMLElement>(".select-field.is-open").forEach((f) => {
    if (f !== except) closeSelect(f);
  });
}

export function initSelectFields() {
  document
    .querySelectorAll<HTMLElement>(".select-field:not([data-select-init])")
    .forEach((field) => {
      const native = field.querySelector<HTMLSelectElement>("select");
      if (!native) return;

      field.dataset.selectInit = "";
      field.classList.add("is-enhanced");

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "select-trigger";
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");

      const value = document.createElement("span");
      value.className = "select-value";

      const chevron = document.createElement("span");
      chevron.className = "select-chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.textContent = "▾";

      trigger.append(value, chevron);

      const list = document.createElement("ul");
      list.className = "select-list";
      list.setAttribute("role", "listbox");
      if (native.id) list.setAttribute("aria-labelledby", native.id);

      const options = Array.from(native.options);
      let focusIndex = Math.max(
        0,
        options.findIndex((o) => o.selected),
      );

      const syncFromNative = (index: number) => {
        const opt = options[index];
        if (!opt) return;

        native.selectedIndex = index;
        value.textContent = opt.text;
        focusIndex = index;

        list.querySelectorAll<HTMLElement>(".select-option").forEach((el, i) => {
          const selected = i === index;
          el.classList.toggle("is-selected", selected);
          el.setAttribute("aria-selected", String(selected));
        });

        native.dispatchEvent(new Event("change", { bubbles: true }));
      };

      options.forEach((opt, i) => {
        const item = document.createElement("li");
        item.className = "select-option";
        item.setAttribute("role", "option");
        item.dataset.index = String(i);
        item.textContent = opt.text;
        if (opt.selected) {
          item.classList.add("is-selected");
          item.setAttribute("aria-selected", "true");
          value.textContent = opt.text;
        } else {
          item.setAttribute("aria-selected", "false");
        }

        item.addEventListener("click", () => {
          syncFromNative(i);
          closeSelect(field);
          trigger.focus();
        });

        list.appendChild(item);
      });

      if (!value.textContent && options[0]) {
        value.textContent = options[0].text;
      }

      trigger.addEventListener("click", () => {
        const open = !field.classList.contains("is-open");
        closeAllSelects(field);
        field.classList.toggle("is-open", open);
        trigger.setAttribute("aria-expanded", String(open));
      });

      trigger.addEventListener("keydown", (e) => {
        const items = list.querySelectorAll<HTMLElement>(".select-option");

        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!field.classList.contains("is-open")) {
            field.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
            return;
          }
          focusIndex = Math.min(focusIndex + 1, items.length - 1);
          items[focusIndex]?.scrollIntoView({ block: "nearest" });
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (!field.classList.contains("is-open")) {
            field.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
            return;
          }
          focusIndex = Math.max(focusIndex - 1, 0);
          items[focusIndex]?.scrollIntoView({ block: "nearest" });
        }

        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!field.classList.contains("is-open")) {
            field.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
          } else {
            syncFromNative(focusIndex);
            closeSelect(field);
          }
        }

        if (e.key === "Escape") closeSelect(field);
      });

      field.append(trigger, list);
    });
}

export function syncSelectFieldFromNative(native: HTMLSelectElement) {
  const field = native.closest<HTMLElement>(".select-field");
  if (!field?.classList.contains("is-enhanced")) return;

  const opt = native.options[native.selectedIndex];
  const value = field.querySelector<HTMLElement>(".select-value");
  if (value && opt) value.textContent = opt.text;

  field.querySelectorAll<HTMLElement>(".select-option").forEach((el, i) => {
    const selected = i === native.selectedIndex;
    el.classList.toggle("is-selected", selected);
    el.setAttribute("aria-selected", String(selected));
  });
}

export function resetEnhancedForm(form: HTMLFormElement) {
  form.reset();
  form.querySelectorAll("select").forEach((el) => {
    if (el instanceof HTMLSelectElement) syncSelectFieldFromNative(el);
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(".select-field")) closeAllSelects();
  });
}
