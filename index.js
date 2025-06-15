import { Parser } from 'json2csv'; // npm install json2csv
import ExcelJS from 'exceljs'; // npm install exceljs


import bodyParser from 'body-parser';
import pool from './db.js';  // Note: add .js extension for local modules in ESM
import express from 'express';
import cors from 'cors';


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());




//task--------------- wise
app.get('/api/cerpschema/task/task_details/boq_items/work_program', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.task_name,
        td.percentage AS planned_progress,
        COALESCE(SUM(dpm.quantity), 0) AS actual_progress
      FROM cerpschema.task t
      JOIN cerpschema.task_details td ON t.task_id = td.task_id
      LEFT JOIN cerpschema.daily_progress_monitoring dpm 
        ON t.task_id = dpm.task_id
      GROUP BY t.task_name, td.percentage;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


//daly line chart--------------------
app.get('/api/cerpschema/daily_progress_monitoring/progress_by_date', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT date, SUM(quantity) AS total_progress
      FROM cerpschema.daily_progress_monitoring
      GROUP BY date
      ORDER BY date;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

 	






// /* ===========================
//    Project Table Routes
// =========================== */

// Get all projects
app.get('/api/cerpschema/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT project_id, project_name, start_date, end_date FROM cerpschema.projects');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get all BOQs
app.get('/api/cerpschema/boqs', async (req, res) => {
  try {
    const result = await pool.query('SELECT boq_id, title FROM cerpschema.boqs');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

/* ===========================
   Work Program Routes
=========================== */

// Get all work programs
app.get('/api/cerpschema/work_program', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cerpschema.work_program');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Insert new work program
app.post('/api/cerpschema/work_program', async (req, res) => {
  try {
    const {
      remarks, created_at, updated_at,
      project_id, boq_id, start_date, end_date, work_name
    } = req.body;

    const query = `
      INSERT INTO cerpschema.work_program 
      (remarks, created_at, updated_at, project_id, boq_id, start_date, end_date, work_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      remarks, created_at, updated_at,
      project_id, boq_id, start_date, end_date, work_name
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting data');
  }
});

// Update work program
app.put('/api/cerpschema/work_program/:work_program_id', async (req, res) => {
  const { work_program_id } = req.params;
  const { work_name, start_date, end_date, created_at, remarks } = req.body;

  try {
    await pool.query(
      `UPDATE cerpschema.work_program 
       SET work_name = $1, start_date = $2, end_date = $3, created_at = $4, remarks = $5, updated_at = NOW()
       WHERE work_program_id = $6`,
      [work_name, start_date, end_date, created_at, remarks, work_program_id]
    );
    res.send('Data updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating data');
  }
});

// Delete work program
app.delete('/api/cerpschema/work_program/:work_program_id', async (req, res) => {
  const { work_program_id } = req.params;
  try {
    await pool.query('DELETE FROM cerpschema.work_program WHERE work_program_id = $1', [work_program_id]);
    res.send('Data deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting data');
  }
});

/* ===========================
   Task Routes
=========================== */

// Get all workprogram
app.get('/api/cerpschema/work_program', async (req, res) => {
  try {
    const result = await pool.query('SELECT work_program_id, work_name FROM cerpschema.work_program');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Get all tasks
app.get('/api/cerpschema/task', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cerpschema.task');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Insert new task
app.post('/api/cerpschema/task', async (req, res) => {
  try {
    const {
      work_program_id, task_name, end_date,
      start_date, remark, created_at, updated_at
    } = req.body;

    const query = `
      INSERT INTO cerpschema.task
      (work_program_id, task_name, end_date, start_date, remark, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      work_program_id, task_name, end_date, start_date, remark, created_at, updated_at
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting task');
  }
});

app.put('/api/cerpschema/task/:task_id', async (req, res) => {
  try {
    const { task_id } = req.params;  // 
    const {
      work_program_id, task_name, end_date,
      start_date, remark, created_at, updated_at
    } = req.body;

    const query = `
      UPDATE cerpschema.task
      SET
        work_program_id = $1,
        task_name = $2,
        end_date = $3,
        start_date = $4,
        remark = $5,
        created_at = $6,
        updated_at = $7
      WHERE task_id = $8
      RETURNING *
    `;

    const result = await pool.query(query, [
      work_program_id, task_name, end_date, start_date, remark, created_at, updated_at, task_id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send('Task not found');
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating task');
  }
});


// Delete task
app.delete('/api/cerpschema/task/:task_id', async (req, res) => {
  const { task_id } = req.params;
  try {
    await pool.query('DELETE FROM cerpschema.task WHERE task_id = $1', [task_id]);
    res.send('Task deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting task');
  }
});

/* ===========================
   Task Details Routes
=========================== */
app.get('/api/cerpschema/task', async (req, res) => {
  try {
    const result = await pool.query('SELECT task_id, task_name FROM cerpschema.task');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// app.get('/api/cerpschema/boq_items', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT boq_item_id , unit FROM cerpschema.boq_items');
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   }
// });


// Get all task details
app.get('/api/cerpschema/task_details', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cerpschema.task_details');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Insert task detail
app.post('/api/cerpschema/task_details', async (req, res) => {
  try {
    const { task_id, percentage, created_at, updated_at } = req.body;

    const query = `
      INSERT INTO cerpschema.task_details
      (task_id, percentage, created_at, updated_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      task_id,  percentage, created_at, updated_at
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting task detail');
  }
});
app.put('/api/cerpschema/task_details/:task_detail_id', async (req, res) => {
  try {
    const { task_detail_id } = req.params;
    const { task_id, percentage, created_at, updated_at } = req.body;

    const query = `
      UPDATE cerpschema.task_details
      SET task_id = $1,
          percentage = $2,
          created_at = $3,
          updated_at = $4
      WHERE task_detail_id = $5
      RETURNING *
    `;

    const result = await pool.query(query, [
      task_id,
      percentage,
      created_at,
      updated_at,
      task_detail_id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task detail not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating task detail');
  }
});


// Delete task detail
app.delete('/api/cerpschema/task_details/:task_detail_id', async (req, res) => {
  const { task_detail_id } = req.params;
  try {
    await pool.query('DELETE FROM cerpschema.task_details WHERE task_detail_id = $1', [task_detail_id]);
    res.send('Task detail deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting task detail');
  }
});

/* ===========================
   Daily Progress Monitoring Routes
=========================== */

// Get all tasks
app.get('/api/cerpschema/task', async (req, res) => {
  try {
    const result = await pool.query('SELECT task_id, task_name FROM cerpschema.task');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// app.get('/api/cerpschema/boq_items', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT boq_item_id , quantity FROM cerpschema.boq_items');
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send('Server Error');
//   }
// });


// Get all progress entries
app.get('/api/cerpschema/daily_progress_monitoring', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cerpschema.daily_progress_monitoring');
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// Insert daily progress
app.post('/api/cerpschema/daily_progress_monitoring', async (req, res) => {
  try {
    const {
      task_id, quantity, date,
      remark, created_at, updated_at
    } = req.body;

    const query = `
      INSERT INTO cerpschema.daily_progress_monitoring 
      (task_id,  quantity, date, remark, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      task_id,quantity, date,
      remark, created_at, updated_at
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error inserting progress');
  }
});

// Update daily progress
app.put('/api/cerpschema/daily_progress_monitoring/:progress_id', async (req, res) => {
  const {
    progress_id, task_id, quantity, date,
    remark, created_at, updated_at
  } = req.body;

  try {
    await pool.query(
      `UPDATE cerpschema.daily_progress_monitoring 
       SET task_id = $1, quantity = $2, date = $3, remark = $4, created_at = $5, updated_at = $6
       WHERE progress_id = $7`,
      [task_id, quantity, date, remark, created_at, updated_at, progress_id]
    );
    res.send('Progress updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating progress');
  }
});

// Delete progress
app.delete('/api/cerpschema/daily_progress_monitoring/:progress_id', async (req, res) => {
  const { progress_id } = req.params;
  try {
    await pool.query('DELETE FROM cerpschema.daily_progress_monitoring WHERE progress_id = $1', [progress_id]);
    res.send('Progress deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting progress');
  }
});

//report page............................................
//
//
    
  


app.get('/api/reports/progress/excel', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.project_name,
        wp.work_name,
        t.task_name,
        td.percentage AS planned_progress,
        dpm.quantity AS actual_progress,
        dpm.date
      FROM cerpschema.projects p
      JOIN cerpschema.work_program wp ON wp.project_id = p.project_id
      JOIN cerpschema.task t ON t.work_program_id = wp.work_program_id
      JOIN cerpschema.task_details td ON td.task_id = t.task_id
      LEFT JOIN cerpschema.daily_progress_monitoring dpm ON dpm.task_id = t.task_id
      ORDER BY p.project_name, wp.work_name, t.task_name, dpm.date;
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Progress Report');

    worksheet.columns = [
      { header: 'Project Name', key: 'project_name', width: 25 },
      { header: 'Work Name', key: 'work_name', width: 25 },
      { header: 'Task Name', key: 'task_name', width: 30 },
      { header: 'Planned (%)', key: 'planned_progress', width: 15 },
      { header: 'Actual (%)', key: 'actual_progress', width: 15 },
      { header: 'Date', key: 'date', width: 20 }
    ];

    result.rows.forEach(row => {
      worksheet.addRow(row);
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'progress_report.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating Excel report');
  }
});




app.get('/api/reports/progress/csv', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.project_name,
        wp.work_name,
        t.task_name,
        td.percentage AS planned_progress,
        dpm.quantity AS actual_progress,
        dpm.date
      FROM cerpschema.projects p
      JOIN cerpschema.work_program wp ON wp.project_id = p.project_id
      JOIN cerpschema.task t ON t.work_program_id = wp.work_program_id
      JOIN cerpschema.task_details td ON td.task_id = t.task_id
      LEFT JOIN cerpschema.daily_progress_monitoring dpm ON dpm.task_id = t.task_id
      ORDER BY p.project_name, wp.work_name, t.task_name, dpm.date;
    `);

    const fields = ['project_name', 'work_name', 'task_name', 'planned_progress', 'actual_progress', 'date'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('progress_report.csv');
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV report');
  }
});


app.get('/api/cerpschema/report', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.project_name,
        wp.work_name,
        t.task_name,
        td.percentage,
        dpm.quantity AS actual_progress,
        dpm.date
      FROM cerpschema.projects p
      JOIN cerpschema.work_program wp ON wp.project_id = p.project_id
      JOIN cerpschema.task t ON t.work_program_id = wp.work_program_id
      JOIN cerpschema.task_details td ON td.task_id = t.task_id
      LEFT JOIN cerpschema.daily_progress_monitoring dpm ON dpm.task_id = t.task_id
      ORDER BY p.project_name, wp.work_name, t.task_name, dpm.date;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating report');
  }
});




/* ===========================
   Server Start
=========================== */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});










