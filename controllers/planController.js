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
        
        console.error("خطأ", error);
        throw error;
    }


    return rows.map(row => ({
        planId: row.id,     
        planName: row.name, 
        available: parseInt(row.available, 10)
    }));
};

const getSoldStockCount = async () => {
    const queryText = `
        SELECT
            p.id AS plan_id,
            p.name AS plan_name,
            COUNT(s.id) AS sold_count
        FROM
            plan p
        LEFT JOIN
            stock s ON p.id = s.plan_id AND s.state = 'sold'
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
        
        console.error("(getSoldStockCount):", error);
        throw error;
    }


    return rows.map(row => ({
        planId: row.plan_id,    
        planName: row.plan_name, 
        soldCount: parseInt(row.sold_count, 10)
    }));
};

const getallavailableplans = async () => {
    const { rows } = await db.query("SELECT * FROM plan");
    return rows;
};

const getplanstocksummary = async (planId) => { 
    const queryText = `
        SELECT
            p.id AS plan_id,
            p.name AS plan_name,
            SUM(CASE WHEN s.state = 'ready' THEN 1 ELSE 0 END) AS ready_count,
            SUM(CASE WHEN s.state = 'sold' THEN 1 ELSE 0 END) AS sold_count,
            SUM(CASE WHEN s.state = 'error' THEN 1 ELSE 0 END) AS error_count
        FROM
            plan p
        LEFT JOIN
            stock s ON p.id = s.plan_id
        WHERE
            p.id = $1
        GROUP BY
            p.id, p.name;
    `;
    
    let row;
    try {
        const result = await db.query(queryText, [planId]);
        row = result.rows[0];
    } catch (error) {
        
        console.error("خطأ", error);
        throw error;
    }

    if (!row) {
        return null; 
    }

    return {
        planId: row.plan_id,
        planName: row.plan_name,
        ready: parseInt(row.ready_count, 10),
        sold: parseInt(row.sold_count, 10),
        error: parseInt(row.error_count, 10)
    };
};

const insertStockBatch = async (planId, codes) => {
    const planCheck = await db.query(
        `SELECT id FROM plan WHERE id = ${planId}`
    );
    
    if (planCheck.rowCount === 0) {
        return { success: false, message: "Plan not found" };
    }
    const safeCodes = codes
        .filter(code => typeof code === 'string' && code.trim() !== '')
        .map(code => `'${code.trim()}'`); 

    if (safeCodes.length === 0) {
        return { success: false, message: "No valid codes provided for insertion." };
    }
    const valuesString = safeCodes.map(code => 
        `(${planId}, ${code}, 'ready')`
    ).join(', ');


    const queryText = `
        INSERT INTO stock (plan_id, code, state)
        VALUES ${valuesString}
        ON CONFLICT (code) DO NOTHING
        RETURNING id; 
    `;

    try {
        const result = await db.query(queryText);
        return { success: true, inserted: result.rowCount };
    } catch (error) {
        console.error("خطأ", error);
        throw error;
    }
};

module.exports = {
  getPlans,
  getPlanById,
  purchase,
  getAvailableStock,
  getSoldStockCount,
  getallavailableplans,
  getplanstocksummary,
  insertStockBatch,
};

