// controllers/planController.js
const db = require("../db");

const getPlans = async () => {
  const { rows } = await db.query("SELECT * FROM plan");
  return rows;
};

const getPlanById = async (palnId) => {
  const { rows } = await db.query(`SELECT * FROM plan WHERE id = ${palnId}`);
  return rows[0];
};

const purchase = async (planId, clientId) => {

  const stockResult = await db.query(
    `SELECT * FROM stock WHERE plan_id = ${planId} AND state = 'redy'`

  );
  if (stockResult.rows.length == 0) {
    return { success: false, message: "no stock" };
  }

  const clientResults = await db.query(
    `SELECT * FROM client WHERE id = ${clientId}`

  );

  if (clientResults.rows.length == 0) {
    return { success: false, message: "منيلك هاي الكلاوات" };
  }

  const planResult = await db.query
  (`SELECT * FROM plan WHERE id = ${planId}`);
 

  let user = clientResults.rows[0];
  let stock = stockResult.rows[0];
  let plan = planResult.rows[0];

  if (user.balance < parseInt(plan.price))
  {
    return { success: false, message: "ماعندك فلوس، روح اشتغل وتعال" };
  }

  await db.query(`UPDATE stock SET state = 'sold' WHERE id = ${stock.id}`);

  await db.query(
    `UPDATE client SET balance = ${
      user.balance - plan.price
    } WHERE id = ${clientId}`
  );

  const result = await db.query(
    `INSERT INTO invoice (plan_id, code, client_id, price, plan_name)
    VALUES (${planId}, '${stock.code}', ${clientId}, ${plan.price}, '${plan.name}')
    RETURNING *;`
  );

  const newInvoice = result.rows[0];

  return { success: true, code: stock.code, newInvoice };
};
const getAvailableStock = async () => {
    const queryText = `
        SELECT
            p.id,                 
            p.name,               
            COUNT(s.id) AS available
        FROM
            plan p
        LEFT JOIN
            stock s ON p.id = s.plan_id AND s.state = 'ready'
        GROUP BY
            p.id, p.name
        ORDER BY
            p.id;
    `;
    
    let rows;
    try {
        const result = await db.query(queryText);
        rows = result.rows;
    } catch (error) {
        
        console.error("خطأ حاد في الاستعلام (getAvailableStock):", error);
        throw error;
    }


    return rows.map(row => ({
        planId: row.id,     
        planName: row.name, 
        available: parseInt(row.available, 10)
    }));
};
module.exports = {
  getPlans,
  getPlanById,
  purchase,
  getAvailableStock,
};

