___________________________________________
SETUP:

Get yourself the .env file.
Start docker desktop, make sure its running


then run:
docker-compose -f docker-compose.dev.yml 

Server should start now.
____________________________________________

Known issues and fixes:

If you face issues with the above try:
docker-compose down (--no-bin-link)
docker system prune
docker-compose -f docker-compose.dev.yml 


if readonly error:
restart docker  (sometimes pc restart needed)
_____________________________________________