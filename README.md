# Olvasó sziget
## Alkalmazás futtatása:
  - clone repository - git clone https://github.com/nemethrami/olvasosziget
  - Futtassa le a `setup_hook.sh` scriptet
    - Ez a script csinál egy pre-commit hook-ot, amely minden commit előtt lefuttatja a teszteket
  - `NodeJS` letöltése a számítógépre
  - `cd frontend/`
  - Frontend mappában: `npm install`
  - Frontend app indítása: `npm run dev`
  - `http://localhost:5173/` -on lehet elérni az alkalmazást

## Hostolt alkalmazás elérése:
  - `https://olvasosziget-4c5e8.web.app/`

## Firebase functions jelenleg nem működik, mert fizetős lenne, a konfigurációja a `function_config_firebase.json`-ben van
  - Van egy olyan function írva, amely törli az 1 hétnél régebben bannolt felhasználókat a banned collection-ből