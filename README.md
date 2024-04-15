# Olvasó sziget
## Alkalmazás futtatása:
  - clone repository - git clone https://github.com/nemethrami/olvasosziget
  - Töltse le a `Docker desktop` alkalmazást a számtógépére
  - Készítse el a `mysql_env_vars.env` file-t a projekt mappában
    - ez a file fogja tartalmazni a titkos adatokat
  - `Docker desktop` futtatása
  - `docker-compose up` futtatása (csak adatbázis miatt van docker egyelőre)
  - Backend mappában virtuális környezet készítése `python -m venv <venv_neve>`
  - Virtuális környezet aktiválása `source <venv>\Scripts\activate` (linux/mac `source <venv>/bin/activate`)
  - Szükséges csomagok telepítése `pip install --no-cache-dir -r requirements.txt`
  - Backend app futtatása `uvicorn main:app --host 0.0.0.0 --port 8000`
  - `NodeJS` letöltése a számítógépre
  - Frontend mappában `npm install`
  - Frontend app indítása `npm run dev`
  - `http://localhost:8080/` -on lehet elérni az alkalmazást
