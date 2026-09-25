# Deployment and installation

## HACS

1. Add this repository to HACS as a custom Dashboard repository.
2. Install **Home Connect Dishwasher Card**.
3. Reload the browser.
4. Register `/hacsfiles/homeassistant_custom_dishwasher_card/`
   `ha_homeconnect_cards.js` as a JavaScript module when HACS has not
   done so automatically.

## Manual installation

Copy `dist/ha_homeconnect_cards.js` to Home Assistant's `www` directory
and register the resulting `/local/` URL as a JavaScript module.

Only tagged release assets or a locally verified build should be deployed.
