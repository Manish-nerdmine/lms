echo "*****Homet huts setup started*****"

echo "*****Installing common node modules*****"
pnpm install

cd apps/auth
chmod +x *.sh
./setup.sh
cd ../../

cd apps/notifications
chmod +x *.sh
./setup.sh