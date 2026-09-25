// x-release-please-start-version
const VERSION = "0.1.0";
// x-release-please-end

const SUFFIXES = {
  connectivity: ["_connectivity"],
  remoteStart: ["_remote_start"],
  door: ["_door"],
  operation: ["_operation_state"],
  finish: ["_program_finish_time"],
  progress: ["_program_progress"],
  activeProgram: ["_active_program"],
  selectedProgram: ["_selected_program"],
  delay: ["_start_in_relative"],
  halfLoad: ["_half_load"],
  hygiene: ["_hygiene"],
  intensiveZone: ["_intensive_zone"],
  power: ["_power"],
  silence: ["_silence", "_silence_on_demand"],
  varioSpeed: ["_vario_speed"],
  stop: ["_stop_program"],
};

const APPLIANCE_PROFILES = Object.freeze({
  DISHWASHER: "dishwasher",
  COFFEE_MAKER: "coffee_maker",
  OVEN: "oven",
  WASHER: "washer",
  DRYER: "dryer",
  GENERIC: "generic",
});

const MODEL_PROFILE_RULES = Object.freeze({
  siemens: [
    {
      profile: APPLIANCE_PROFILES.DISHWASHER,
      prefixes: ["SN", "SX", "SR", "SK"],
    },
    {
      profile: APPLIANCE_PROFILES.COFFEE_MAKER,
      prefixes: ["TE", "TP", "TQ", "CT"],
    },
    {
      profile: APPLIANCE_PROFILES.OVEN,
      prefixes: ["HB", "HN", "HR", "HS", "HM", "CM", "CD"],
    },
    {
      profile: APPLIANCE_PROFILES.WASHER,
      prefixes: ["WM", "WG", "WU"],
    },
    {
      profile: APPLIANCE_PROFILES.DRYER,
      prefixes: ["WT"],
    },
  ],

  bosch: [
    {
      profile: APPLIANCE_PROFILES.DISHWASHER,
      prefixes: ["SMS", "SMV", "SMI", "SMD", "SBV", "SPV", "SPS"],
    },
    {
      profile: APPLIANCE_PROFILES.COFFEE_MAKER,
      prefixes: ["CTL", "TIE", "TIS", "TQU"],
    },
    {
      profile: APPLIANCE_PROFILES.OVEN,
      prefixes: ["HBG", "HRG", "HSG", "HMG", "CMG", "CSG"],
    },
    {
      profile: APPLIANCE_PROFILES.WASHER,
      prefixes: ["WGB", "WGG", "WAX", "WAN"],
    },
    {
      profile: APPLIANCE_PROFILES.DRYER,
      prefixes: ["WQB", "WQG", "WTW"],
    },
  ],
});

const normalizeApplianceModel = (model) =>
  String(model || "")
    .trim()
    .toUpperCase()
    .split("/")[0]
    .replace(/[^A-Z0-9]/g, "");

const getApplianceBrand = (manufacturer) => {
  const normalizedManufacturer = String(manufacturer || "")
    .trim()
    .toLowerCase();

  if (normalizedManufacturer.includes("siemens")) {
    return "siemens";
  }

  if (normalizedManufacturer.includes("bosch")) {
    return "bosch";
  }

  return null;
};

const detectApplianceProfile = (device) => {
  const manufacturer = String(device?.manufacturer || "").trim();
  const brand = getApplianceBrand(manufacturer);
  const model = normalizeApplianceModel(device?.model);

  const fallback = {
    type: APPLIANCE_PROFILES.GENERIC,
    source: "fallback",
    manufacturer,
    brand,
    model,
    matchedPrefix: null,
  };

  if (!brand || !model) {
    return fallback;
  }

  const matches = MODEL_PROFILE_RULES[brand]
    .flatMap((rule) =>
      rule.prefixes.map((prefix) => ({
        type: rule.profile,
        prefix,
      })),
    )
    .filter((rule) => model.startsWith(rule.prefix))
    .sort((first, second) => second.prefix.length - first.prefix.length);

  const match = matches[0];

  if (!match) {
    return fallback;
  }

  return {
    type: match.type,
    source: "model",
    manufacturer,
    brand,
    model,
    matchedPrefix: match.prefix,
  };
};

const DEFAULT_PROGRAMS = {
  dishcare_dishwasher_program_intensiv_70: "Intensiv 70 °C",
  dishcare_dishwasher_program_auto_2: "Auto",
  dishcare_dishwasher_program_eco_50: "Eco 50 °C",
  dishcare_dishwasher_program_quick_45: "Schnell 45 °C",
  dishcare_dishwasher_program_pre_rinse: "Vorspülen",
  dishcare_dishwasher_program_quick_65: "Schnell 65 °C",
  dishcare_dishwasher_program_machine_care: "Maschinenpflege",
};

const TEXT = {
  de: {
    loading: "Geschirrspüler wird geladen …",
    missing: "Keine Home-Connect-Entitäten gefunden.",
    online: "Online",
    offline: "Offline",
    remote: "Fernstart",
    noRemote: "Kein Fernstart",
    open: "Tür offen",
    closed: "Tür geschlossen",
    locked: "Verriegelt",
    progress: "Fortschritt",
    finish: "Fertig",
    program: "Programm",
    delay: "Startverzögerung",
    options: "Optionen",
    now: "Jetzt",
    active: "Aktiv",
    off: "Aus",
    powerOn: "Einschalten",
    stop: "Programm stoppen",
    confirm: "Laufendes Programm wirklich stoppen?",
    noProgram: "Kein Programm gewählt",
    inactive: "Inaktiv",
    ready: "Bereit",
    delayedstart: "Start geplant",
    run: "Läuft",
    pause: "Pausiert",
    actionrequired: "Eingriff erforderlich",
    finished: "Fertig",
    error: "Fehler",
    aborting: "Wird abgebrochen",
    unknown: "Status unbekannt",
    intensiveZone: "Intensivzone",
    varioSpeed: "VarioSpeed+",
    hygiene: "Hygiene+",
    halfLoad: "Halbe Beladung",
    silence: "Silence on Demand",
  },
  en: {
    loading: "Loading dishwasher …",
    missing: "No Home Connect entities found.",
    online: "Online",
    offline: "Offline",
    remote: "Remote start",
    noRemote: "No remote start",
    open: "Door open",
    closed: "Door closed",
    locked: "Locked",
    progress: "Progress",
    finish: "Finish",
    program: "Program",
    delay: "Start delay",
    options: "Options",
    now: "Now",
    active: "Active",
    off: "Off",
    powerOn: "Power on",
    stop: "Stop program",
    confirm: "Really stop the running program?",
    noProgram: "No program selected",
    inactive: "Inactive",
    ready: "Ready",
    delayedstart: "Scheduled",
    run: "Running",
    pause: "Paused",
    actionrequired: "Action required",
    finished: "Finished",
    error: "Error",
    aborting: "Aborting",
    unknown: "Unknown state",
    intensiveZone: "Intensive zone",
    varioSpeed: "VarioSpeed+",
    hygiene: "Hygiene+",
    halfLoad: "Half load",
    silence: "Silence on demand",
  },
};

class HomeConnectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._entities = null;
    this._discovering = false;
    this._signature = "";
  }

  //static getStubConfig() {
  //return { type: "custom:homeconnect-card", device_id: "", title: "Geschirrspüler" };
  //}

  static getStubConfig() {
    return {
      show_program: true,
      show_delay: true,
      show_options: true,
    };
  }

  static getConfigElement() {
    return document.createElement("ha-homeconnect-card-editor");
  }

  static getConfigForm() {
    const labels = {
      device_id: "Home Connect device",
      title: "Card title",
      accent_color: "Accent color (CSS)",
      show_program: "Show program selection",
      show_delay: "Show delayed start",
      show_options: "Show program options",
      connectivity: "Connectivity",
      remoteStart: "Remote start",
      door: "Door state",
      operation: "Operation state",
      finish: "Program finish time",
      progress: "Program progress",
      activeProgram: "Active program",
      selectedProgram: "Selected program",
      delay: "Delayed start",
      halfLoad: "Half load",
      hygiene: "Hygiene+",
      intensiveZone: "Intensive zone",
      power: "Power",
      silence: "Silence on demand",
      varioSpeed: "VarioSpeed+",
      stop: "Stop program",
    };

    const entity = (name, domain) => ({
      name,
      selector: {
        entity: {
          filter: [{ integration: "home_connect", domain }],
        },
      },
    });

    return {
      schema: [
        {
          name: "device_id",
          selector: {
            device: {
              filter: [{ integration: "home_connect" }],
            },
          },
        },
        { name: "title", selector: { text: {} } },
        { name: "accent_color", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          flatten: true,
          column_min_width: "180px",
          schema: [
            { name: "show_program", selector: { boolean: {} } },
            { name: "show_delay", selector: { boolean: {} } },
            { name: "show_options", selector: { boolean: {} } },
          ],
        },
        {
          type: "expandable",
          name: "entities",
          title: "Manual entity mapping (advanced)",
          schema: [entity("connectivity", "binary_sensor"), entity("remoteStart", "binary_sensor"), entity("door", "sensor"), entity("operation", "sensor"), entity("finish", "sensor"), entity("progress", "sensor"), entity("activeProgram", "select"), entity("selectedProgram", "select"), entity("delay", "number"), entity("halfLoad", "switch"), entity("hygiene", "switch"), entity("intensiveZone", "switch"), entity("power", "switch"), entity("silence", "switch"), entity("varioSpeed", "switch"), entity("stop", "button")],
        },
      ],
      computeLabel: (schema) => labels[schema.name],
      computeHelper: (schema) => (schema.name === "device_id" ? "Select a Home Connect appliance. Entities will be discovered automatically." : undefined),
    };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid homeconnect-card configuration");
    }
    this._config = {
      title: "",
      show_program: true,
      show_delay: true,
      show_options: true,
      ...config,
    };
    const configuredEntities = Object.fromEntries(Object.entries(config.entities || {}).filter(([, entityId]) => Boolean(entityId)));

    this._entities = Object.keys(configuredEntities).length ? configuredEntities : null;
    this._discovering = false;
    this._signature = "";
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._entities && !this._discovering && this._config?.device_id) {
      void this._discover();
    }
    const signature = this._stateSignature();
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  getCardSize() {
    return 5;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 5, min_rows: 4 };
  }

  get _language() {
    const language = this._hass?.locale?.language || this._hass?.language || "de";
    return String(language).toLowerCase().startsWith("de") ? "de" : "en";
  }

  get _text() {
    return TEXT[this._language];
  }

  async _discover() {
    this._discovering = true;
    this._render();
    try {
      const result = await this._hass.callWS({ type: "config/entity_registry/list_for_display" });
      const registry = Array.isArray(result) ? result : result?.entities || [];
      const ids = registry
        .filter((entry) => {
          const device = entry.di || entry.device_id;
          const platform = entry.pl || entry.platform;
          return device === this._config.device_id && (!platform || platform === "home_connect");
        })
        .map((entry) => entry.ei || entry.entity_id)
        .filter(Boolean);

      this._entities = {};
      for (const [key, suffixes] of Object.entries(SUFFIXES)) {
        const id = ids.find((candidate) => suffixes.some((suffix) => candidate.endsWith(suffix)));
        if (id) this._entities[key] = id;
      }
    } catch (error) {
      console.error("homeconnect-card discovery failed", error);
      this._entities = {};
    } finally {
      this._discovering = false;
      this._signature = "";
      this._render();
    }
  }

  _stateSignature() {
    if (!this._hass || !this._entities) return "";

    const relevant = {};
    const device = this._hass?.devices?.[this._config?.device_id];
    const profile = detectApplianceProfile(device);

    relevant.__profile = [profile.type, profile.brand, profile.model, profile.matchedPrefix];

    for (const [key, id] of Object.entries(this._entities)) {
      const state = this._hass.states[id];
      relevant[key] = state ? [state.state, state.attributes?.options] : null;
    }

    return JSON.stringify(relevant);
  }

  _state(key) {
    const id = this._entities?.[key];
    return id ? this._hass?.states?.[id] : undefined;
  }

  _available(key) {
    const state = this._state(key);
    return Boolean(state && !["unavailable", "unknown"].includes(state.state));
  }

  _on(key) {
    return this._state(key)?.state === "on";
  }
  _operation() {
    return this._state("operation")?.state || "unknown";
  }
  _running() {
    return ["run", "pause", "delayedstart", "aborting"].includes(this._operation());
  }

  _progress() {
    const value = Number(this._state("progress")?.state);
    return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : null;
  }

  _program() {
    const invalid = ["", "unknown", "unavailable", "none"];
    const active = this._state("activeProgram")?.state || "";
    if (!invalid.includes(active)) return active;
    const selected = this._state("selectedProgram")?.state || "";
    return invalid.includes(selected) ? "" : selected;
  }

  _programLabel(value) {
    if (!value) return this._text.noProgram;
    const names = { ...DEFAULT_PROGRAMS, ...(this._config.program_names || {}) };
    return names[value] || value.replace(/^dishcare_dishwasher_program_/, "").replaceAll("_", " ");
  }

  _finish() {
    const value = this._state("finish")?.state;
    if (!value || ["unknown", "unavailable", "none"].includes(value)) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(this._language === "de" ? "de-CH" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  _door() {
    const state = this._state("door")?.state;
    if (state === "open") return { label: this._text.open, icon: "mdi:door-open", tone: "warning" };
    if (state === "locked") return { label: this._text.locked, icon: "mdi:door-closed-lock", tone: "good" };
    return { label: this._text.closed, icon: "mdi:door-closed", tone: "muted" };
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _applianceProfile() {
    const device = this._hass?.devices?.[this._config?.device_id];
    const profile = detectApplianceProfile(device);

    const profileSignature = [this._config?.device_id, profile.type, profile.brand, profile.model, profile.matchedPrefix].join("|");

    if (profileSignature !== this._lastProfileSignature) {
      this._lastProfileSignature = profileSignature;

      console.info("[HA HomeConnect Cards] Appliance profile detected", {
        deviceId: this._config?.device_id,
        deviceName: device?.name_by_user || device?.name,
        ...profile,
      });
    }

    return profile;
  }

  _profileIcon(type) {
    switch (type) {
      case APPLIANCE_PROFILES.DISHWASHER:
        return "mdi:dishwasher";

      case APPLIANCE_PROFILES.COFFEE_MAKER:
        return "mdi:coffee-maker";

      case APPLIANCE_PROFILES.OVEN:
        return "mdi:stove";

      case APPLIANCE_PROFILES.WASHER:
        return "mdi:washing-machine";

      case APPLIANCE_PROFILES.DRYER:
        return "mdi:tumble-dryer";

      default:
        return "mdi:devices";
    }
  }

  _title() {
    const configuredTitle = String(this._config?.title || "").trim();

    if (configuredTitle) {
      return configuredTitle;
    }

    const device = this._hass?.devices?.[this._config?.device_id];

    return device?.name_by_user || device?.name || "Home Connect Appliance";
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    if (!this._hass || this._discovering) {
      this.shadowRoot.innerHTML = this._frame(`<div class="message"><span class="spinner"></span>${this._text.loading}</div>`);
      return;
    }
    if (!this._entities || !Object.keys(this._entities).length) {
      this.shadowRoot.innerHTML = this._frame(`<div class="message error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>${this._text.missing}</div>`);
      return;
    }
    const t = this._text;
    const profile = this._applianceProfile();
    const operation = this._operation();
    const progress = this._progress();
    const percentage = progress ?? 0;
    const circumference = 2 * Math.PI * 58;
    const offset = circumference * (1 - percentage / 100);
    const program = this._program();
    const finish = this._finish();
    const door = this._door();
    const connectivity = this._state("connectivity");
    const remote = this._on("remoteStart");
    const running = this._running();
    const connectivityText = connectivity ? this._hass.formatEntityState?.(connectivity) || connectivity.state : "";
    const connectivityColor = connectivity?.state === "on" ? "var(--success-color)" : connectivity?.state === "off" ? "var(--error-color)" : "var(--warning-color)";
    const progressState = this._state("progress");
    const showProgress = Boolean(progressState) && progress !== null;

    const progressText = showProgress ? this._hass.formatEntityState?.(progressState) || `${Math.round(progress)}%` : "";

    const progressName = progressState?.attributes?.friendly_name || t.progress;

    this.shadowRoot.innerHTML = this._frame(`
      <div class="card" style="--accent:${this._escape(this._config.accent_color || "var(--primary-color)")}">
        <header>
          <div><div class="title">${this._escape(this._title())}</div><div class="subtitle">${this._escape(this._programLabel(program))}</div></div>
         
${
  connectivity
    ? ` <ha-badge type="button" data-info="connectivity" style="--badge-color:${connectivityColor}">
    <ha-icon slot="icon" icon="mdi:lan-connect"></ha-icon>
    <span>${this._escape(connectivityText)}</span>
  </ha-badge>
`
    : ""
}

        </header>
        <div class="hero">
          
       ${showProgress ? `
  <section data-info="progress">
    <label>
      <ha-icon icon="mdi:progress-clock"></ha-icon>
      ${this._escape(progressName)} · ${this._escape(progressText)}
    </label>

    <ha-bar id="program-progress"></ha-bar>
  </section>
` : ""}

          <div class="summary">
            <div class="operation ${this._escape(operation)}">${this._escape(t[operation] || t.unknown)}</div>
            <div class="program">${this._escape(this._programLabel(program))}</div>
            <div class="facts">
              ${finish ? `<div><ha-icon icon="mdi:clock-check-outline"></ha-icon><span><small>${t.finish}</small>${this._escape(finish)}</span></div>` : ""}
              ${this._state("door") ? `<div><ha-icon icon="${door.icon}"></ha-icon><span><small>${t.program}</small>${this._escape(door.label)}</span></div>` : ""}
            </div>
          </div>
        </div>
        <div class="pills">
          ${this._state("door") ? `<button class="pill ${door.tone}" data-info="door"><ha-icon icon="${door.icon}"></ha-icon>${this._escape(door.label)}</button>` : ""}
          ${this._state("remoteStart") ? `<button class="pill ${remote ? "good" : "muted"}" data-info="remoteStart"><ha-icon icon="${remote ? "mdi:play-network" : "mdi:play-network-outline"}"></ha-icon>${remote ? t.remote : t.noRemote}</button>` : ""}
        </div>
        ${this._programControl(running)}
        ${this._delayControl(running)}
        ${this._optionControls()}
        ${this._actions()}
      </div>
    `);

const progressBar =
  this.shadowRoot.querySelector("#program-progress");

if (progressBar && showProgress) {
  progressBar.min = 0;
  progressBar.max = 100;
  progressBar.value = progress;
}

    this._bind();
  }

  _programControl(running) {
    if (!this._config.show_program || !this._available("selectedProgram")) return "";
    const state = this._state("selectedProgram");
    const options = state.attributes?.options || [];
    if (!options.length) return "";
    const html = options.map((value) => `<option value="${this._escape(value)}" ${value === state.state ? "selected" : ""}>${this._escape(this._programLabel(value))}</option>`).join("");
    return `<section><label><ha-icon icon="mdi:playlist-check"></ha-icon>${this._text.program}</label><div class="select"><select id="program" ${running ? "disabled" : ""}>${html}</select><ha-icon icon="mdi:chevron-down"></ha-icon></div></section>`;
  }

  _delayControl(running) {
    if (!this._config.show_delay || !this._available("delay") || running) return "";
    return `<section><label><ha-icon icon="mdi:clock-start"></ha-icon>${this._text.delay}</label><div class="segments"><button data-delay="0">${this._text.now}</button><button data-delay="3600">+1 h</button><button data-delay="10800">+3 h</button></div></section>`;
  }

  _optionControls() {
    if (!this._config.show_options) return "";
    const definitions = [
      ["intensiveZone", this._text.intensiveZone, "mdi:pot-steam"],
      ["varioSpeed", this._text.varioSpeed, "mdi:speedometer"],
      ["hygiene", this._text.hygiene, "mdi:shield-check-outline"],
      ["halfLoad", this._text.halfLoad, "mdi:circle-half-full"],
      ["silence", this._text.silence, "mdi:volume-off"],
    ];
    const buttons = definitions
      .filter(([key]) => this._available(key))
      .map(([key, label, icon]) => {
        const active = this._on(key);
        return `<button class="option ${active ? "active" : ""}" data-toggle="${key}"><ha-icon icon="${icon}"></ha-icon><span><b>${this._escape(label)}</b><small>${active ? this._text.active : this._text.off}</small></span></button>`;
      })
      .join("");
    return buttons ? `<section><label><ha-icon icon="mdi:tune-variant"></ha-icon>${this._text.options}</label><div class="options">${buttons}</div></section>` : "";
  }

  _actions() {
    const power = this._available("power") && !this._on("power");
    const stop = Boolean(this._state("stop")) && this._running();
    if (!power && !stop) return "";
    return `<footer>${power ? `<button class="action primary" data-action="power"><ha-icon icon="mdi:power"></ha-icon>${this._text.powerOn}</button>` : ""}${stop ? `<button class="action danger" data-action="stop"><ha-icon icon="mdi:stop-circle-outline"></ha-icon>${this._text.stop}</button>` : ""}</footer>`;
  }

  _bind() {
    this.shadowRoot.querySelectorAll("[data-info]").forEach((element) => element.addEventListener("click", () => this._moreInfo(element.dataset.info)));
    this.shadowRoot.querySelectorAll("[data-toggle]").forEach((element) => element.addEventListener("click", () => this._service("homeassistant", "toggle", { entity_id: this._entities[element.dataset.toggle] })));
    this.shadowRoot.querySelectorAll("[data-delay]").forEach((element) => element.addEventListener("click", () => this._service("number", "set_value", { entity_id: this._entities.delay, value: Number(element.dataset.delay) })));
    this.shadowRoot.querySelector('[data-action="power"]')?.addEventListener("click", () => this._service("switch", "turn_on", { entity_id: this._entities.power }));
    this.shadowRoot.querySelector('[data-action="stop"]')?.addEventListener("click", () => {
      if (globalThis.confirm(this._text.confirm)) this._service("button", "press", { entity_id: this._entities.stop });
    });
    this.shadowRoot.getElementById("program")?.addEventListener("change", (event) => this._service("select", "select_option", { entity_id: this._entities.selectedProgram, option: event.target.value }));
  }

  _moreInfo(key) {
    const entityId = this._entities[key];
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }

  async _service(domain, service, data) {
    try {
      await this._hass.callService(domain, service, data);
    } catch (error) {
      console.error(`dishwasher-card ${domain}.${service} failed`, error);
    }
  }

  _frame(content) {
    return `<style>
      :host{display:block;container-type:inline-size}ha-card{overflow:hidden}.card{padding:20px;color:var(--primary-text-color)}header{display:flex;justify-content:space-between;gap:16px;margin-bottom:12px}.title{font-size:1.25rem;font-weight:700}.subtitle,.program{color:var(--secondary-text-color);margin-top:3px}.status,.pill{border:0;border-radius:999px;background:var(--secondary-background-color);padding:7px 10px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;color:inherit;white-space:nowrap}.status span{width:7px;height:7px;border-radius:50%;background:currentColor}.good{color:var(--success-color,#43a047)}.bad{color:var(--error-color,#db4437)}.warning{color:var(--warning-color,#f9a825)}.muted{color:var(--secondary-text-color)}
      .hero{display:grid;grid-template-columns:170px 1fr;align-items:center;gap:20px;padding:4px 0 16px}.visual{width:160px;height:160px;position:relative;display:grid;place-items:center;margin:auto}.visual svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}circle{fill:none;stroke-width:8}.track{stroke:var(--divider-color)}.value{stroke:var(--accent);stroke-linecap:round;transition:stroke-dashoffset .4s}.machine{width:84px;height:84px;border-radius:26px;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--accent);position:relative;box-shadow:inset 0 0 0 1px var(--divider-color)}.machine ha-icon{--mdc-icon-size:52px}.running .machine{animation:pulse 2s ease-in-out infinite}.machine i{position:absolute;border:2px solid var(--accent);border-radius:50%;opacity:0;animation:bubble 2.4s ease-in-out infinite}.b1{width:8px;height:8px;left:18px;bottom:15px}.b2{width:5px;height:5px;left:40px;bottom:10px;animation-delay:.7s!important}.b3{width:10px;height:10px;right:17px;bottom:17px;animation-delay:1.3s!important}.percent{position:absolute;bottom:-2px;background:var(--ha-card-background,var(--card-background-color));padding:2px 8px;border-radius:99px;display:flex;gap:4px;align-items:baseline}.percent small{color:var(--secondary-text-color)}.operation{font-size:1.7rem;font-weight:750}.operation.run{color:var(--success-color,#43a047)}.operation.pause,.operation.delayedstart{color:var(--warning-color,#f9a825)}.operation.error{color:var(--error-color,#db4437)}.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:18px}.facts>div{display:flex;gap:8px;align-items:center}.facts ha-icon,section>label ha-icon{color:var(--accent)}.facts span{display:flex;flex-direction:column}.facts small{color:var(--secondary-text-color)}
      .pills{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}.pill ha-icon{--mdc-icon-size:17px}section{border-top:1px solid var(--divider-color);padding-top:14px;margin-top:14px}section>label{display:flex;align-items:center;gap:7px;color:var(--secondary-text-color);font-size:.8rem;font-weight:650;margin-bottom:9px}.select{position:relative}.select select{width:100%;appearance:none;border:1px solid var(--divider-color);border-radius:12px;padding:12px 42px 12px 13px;background:var(--secondary-background-color);color:var(--primary-text-color)}.select>ha-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none}.segments{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.segments button,.option{border:1px solid var(--divider-color);border-radius:11px;background:var(--secondary-background-color);color:inherit;cursor:pointer}.segments button{padding:9px}.options{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.option{padding:11px;display:flex;align-items:center;gap:10px;text-align:left}.option span{display:flex;flex-direction:column}.option small{color:var(--secondary-text-color);margin-top:2px}.option.active{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 12%,var(--secondary-background-color))}.option.active ha-icon{color:var(--accent)}footer{display:flex;gap:9px;margin-top:18px}.action{flex:1;border:0;border-radius:12px;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;cursor:pointer}.primary{background:var(--accent);color:var(--text-primary-color,#fff)}.danger{background:color-mix(in srgb,var(--error-color,#db4437) 14%,var(--secondary-background-color));color:var(--error-color,#db4437)}.message{min-height:120px;padding:24px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--secondary-text-color)}.error{color:var(--error-color,#db4437)}.spinner{width:24px;height:24px;border:3px solid var(--divider-color);border-top-color:var(--primary-color);border-radius:50%;animation:spin .8s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{50%{transform:scale(1.04)}}@keyframes bubble{0%{transform:translateY(0) scale(.6);opacity:0}25%{opacity:.8}100%{transform:translateY(-48px) scale(1.15);opacity:0}}
      @container(max-width:430px){.card{padding:16px}.hero{grid-template-columns:1fr;gap:8px}.visual{width:145px;height:145px}.summary{text-align:center}.operation{font-size:1.45rem}.facts{justify-content:center}.pills{justify-content:center}}@container(max-width:320px){.options,.facts{grid-template-columns:1fr}footer{flex-direction:column}}@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
    </style><ha-card>${content}</ha-card>`;
  }
}

class HomeConnectCardEditor extends HTMLElement {
  constructor() {
    super();

    this._hass = null;
    this._config = null;

    this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
      }

      ha-form {
        display: block;
      }
    `;

    this._form = document.createElement("ha-form");
    this._form.addEventListener("value-changed", (event) => this._valueChanged(event));

    this.shadowRoot.append(style, this._form);
  }

  set hass(hass) {
    this._hass = hass;

    if (this._form) {
      this._form.hass = hass;
    }

    this._updateForm();
  }

  setConfig(config) {
    this._config = {
      ...config,
    };

    this._updateForm();
  }

  _deviceEntityIds(deviceId) {
    if (!this._hass || !deviceId) {
      return [];
    }

    return Object.entries(this._hass.entities || {})
      .map(([entityId, entry]) => ({
        entityId: entry.entity_id || entityId,
        deviceId: entry.device_id,
        platform: entry.platform,
      }))
      .filter((entry) => entry.deviceId === deviceId && (!entry.platform || entry.platform === "home_connect"))
      .map((entry) => entry.entityId)
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second));
  }

  _selectorDomains(entitySelector) {
    const filters = Array.isArray(entitySelector?.filter) ? entitySelector.filter : entitySelector?.filter ? [entitySelector.filter] : [];

    return new Set(
      filters.flatMap((filter) => {
        if (!filter?.domain) {
          return [];
        }

        return Array.isArray(filter.domain) ? filter.domain : [filter.domain];
      }),
    );
  }

  _filterSchema(schema, allowedEntityIds) {
    return schema.map((field) => {
      const updatedField = {
        ...field,
      };

      if (Array.isArray(field.schema)) {
        updatedField.schema = this._filterSchema(field.schema, allowedEntityIds);
      }

      const entitySelector = field.selector?.entity;

      if (!entitySelector) {
        return updatedField;
      }

      const domains = this._selectorDomains(entitySelector);

      const includeEntities = allowedEntityIds.filter((entityId) => {
        if (!domains.size) {
          return true;
        }

        const domain = entityId.split(".")[0];
        return domains.has(domain);
      });

      updatedField.selector = {
        ...field.selector,
        entity: {
          ...entitySelector,
          include_entities: includeEntities,
        },
      };

      return updatedField;
    });
  }

  _updateForm() {
    if (!this._form || !this._hass || !this._config) {
      return;
    }

    const formDefinition = HomeConnectCard.getConfigForm();

    const allowedEntityIds = this._deviceEntityIds(this._config.device_id);

    this._form.hass = this._hass;
    this._form.data = this._config;
    this._form.schema = this._filterSchema(formDefinition.schema, allowedEntityIds);
    this._form.computeLabel = formDefinition.computeLabel;
    this._form.computeHelper = formDefinition.computeHelper;
  }

  _valueChanged(event) {
    event.stopPropagation();

    const nextConfig = {
      ...event.detail.value,
    };

    const previousDeviceId = this._config?.device_id;
    const nextDeviceId = nextConfig.device_id;

    if (previousDeviceId !== nextDeviceId) {
      delete nextConfig.entities;
    }

    this._config = nextConfig;
    this._updateForm();

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: {
          config: nextConfig,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

if (!customElements.get("ha-homeconnect-card-editor")) {
  customElements.define("ha-homeconnect-card-editor", HomeConnectCardEditor);
}

if (!customElements.get("homeconnect-card")) {
  customElements.define("homeconnect-card", HomeConnectCard);
}
globalThis.customCards = globalThis.customCards || [];
const matchesEntity = (entity, terms) => {
  const entityId = String(entity?.entity_id || entity || "").toLowerCase();
  const name = String(entity?.attributes?.friendly_name || entity?.name || "").toLowerCase();
  return terms.some((term) => entityId.includes(term) || name.includes(term));
};

globalThis.customCards.push({
  type: "homeconnect-card",
  name: "Home Connect Card",
  description: "Card for Home Connect Appliances",
  preview: true,
  getEntitySuggestion: (hass, entityId) => {
    if (!matchesEntity(hass.states?.[entityId], ["dishwasher", "geschirrspuler", "geschirrspüler", "dishcare_dishwasher"])) return null;
    const device_id = hass.entities?.[entityId]?.device_id;
    if (!device_id) return null;
    return {
      config: {
        type: "custom:homeconnect-card",
        device_id,
      },
    };
  },
});
//console.info(`%c DISHWASHER-CARD %c ${VERSION} `, "color:#fff;background:#1976d2;font-weight:700", "color:#1976d2;background:#fff;font-weight:700");
