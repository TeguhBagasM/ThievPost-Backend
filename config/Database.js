import { Sequelize } from "sequelize";

const db = new Sequelize("postthiev", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

export default db;
