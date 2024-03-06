#  MicroService (Restaurant Plugin)

The micro-service (Restaurant Plugin) is responsible for Restaurant control services, Billing and order placement for consumer application.


## Prerequisites

| Tool             | Version/Type    |
| :---:            | :---:           |
| OS               | any             |
| Mariadb OR MySQL | 10.3.23-MariaDB |
| Node             | v14 OR v16      |
| Npm			   | 6.13.4          |
| pm2  		       | 4.2.3           |
| Mongo			   | v4.0.19         |
| nginx			   | 1.16.1          |
| SELinux		   | Turned OFF      |
| User			   | Web             |


##  App setup

- ``npm i && npm i -g nodemon``
- ``cp example.config.yaml config.yaml``
- setup your config.yaml file respectively

## Database setup

- update your app and db credentials in config app
- create database using configurations ``npx sequelize-cli db:create``
- run database migration ``npx sequelize-cli db:migrate``
- run default data with seeders ``npx sequelize-cli db:seed:all``


## Run app

```
nodemon server.js
```