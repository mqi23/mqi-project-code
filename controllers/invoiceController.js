const db = require("../db");

const getClientInvoices = async (clientId) => {
    const clientCheck = await db.query(
        `SELECT id FROM client WHERE id = ${clientId}`
    );
    
    if (clientCheck.rowCount === 0) {
        return { success: false, message: "Client not found" };
    }
    const queryText = `
        SELECT 
            id, 
            plan_id, 
            code, 
            price, 
            plan_name, 
            created_at 
        FROM 
            invoice 
        WHERE 
            client_id = ${clientId} 
        ORDER BY 
            created_at DESC
        LIMIT 50;
    `;

    try {
        const result = await db.query(queryText);
        return { success: true, invoices: result.rows };
    } catch (error) {
        console.error("خطأ", error);
        throw error;
    }
};

module.exports = {
    getClientInvoices,
};  