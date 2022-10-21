#!/bin/sh

echo Building common
cd school-games-common
npm run build
cd ..

echo Building frontend
cd school-games-frontend
npm run build
cd ..

echo Building backend
cd school-games-backend
npm run build
cd ..

echo Creating distro tar
tar -cf school-games-distro.tar.gz \
        school-games-backend/dist \
        school-games-backend/package*.json \
        school-games-frontend/package*.json \
        school-games-frontend/dist \
        school-games-common/school-games-common*.tgz

echo Done.