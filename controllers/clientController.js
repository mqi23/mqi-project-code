// controllers/clientController.js
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (body) => {
  const phone = body.phone;
  const password = body.password;
  const name = body.name;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(`INSERT INTO Client (name, phone, password)
                VALUES
                ('${name}', '${phone}', '${hashedPassword}');`);

  if (result.rowCount === 1) {
    return true;
  } else {
    return false;
  }
};

const login = async (phone, password) => {
  const result = await db.query(`select * from client where phone = '${phone}'`);
  if (result.rowCount !== 1) {
    return { success: false, message: "user not found!" };
  }

  const user = result.rows[0];
  const hashedPassword = user.password;
  const isPassValid = await bcrypt.compare(password, hashedPassword);
  if (!isPassValid) {
    return { success: false, message: "لاتصير لوتي" };
  }

  const token = jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      name: user.name,
    },
    process.env.SECRET_KEY 
  );
  
  return { success: true, token: token };
};

const getBalance = async (clientId) => {
    const result = await db.query(
        `SELECT id, name, balance FROM client WHERE id = ${clientId}`
    );
    
    if (result.rowCount === 0) {
        return { success: false, message: "Client not found" };
    }
    
    return { success: true, client: result.rows[0] };
};

const topupClientBalance = async (clientId, amount) => {
    const clientResult = await db.query(
        `SELECT * FROM client WHERE id = ${clientId}`
    );

    if (clientResult.rowCount === 0) {
        return { success: false, message: "Client not found" };
    }

    const oldBalance = clientResult.rows[0].balance;
    const newBalance = oldBalance + amount;

    await db.query(
        `UPDATE client SET balance = ${newBalance} WHERE id = ${clientId}`
    );

    return {
        success: true,
        id: clientId,
        oldBalance: oldBalance,
        newBalance: newBalance,
    };
};
module.exports = {
  register,
  login,
  getBalance,
  topupClientBalance,
};
