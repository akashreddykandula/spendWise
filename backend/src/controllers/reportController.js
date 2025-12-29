import Transaction from '../models/Transaction.js';
import PDFDocument from 'pdfkit';
import {Parser} from 'json2csv';

// 📄 PDF report
export const downloadPDF = async (req, res) => {
  const userId = req.user._id;

  const start = new Date ();
  start.setDate (1);
  start.setHours (0, 0, 0, 0);

  const txns = await Transaction.find ({
    user: userId,
    date: {$gte: start, $lte: new Date ()},
  }).sort ({date: -1});

  const doc = new PDFDocument ();
  res.setHeader ('Content-Type', 'application/pdf');
  res.setHeader ('Content-Disposition', 'attachment; filename=report.pdf');

  doc.pipe (res);
  doc.fontSize (18).text ('Monthly Expense Report', {align: 'center'});
  doc.moveDown ();

  txns.forEach (t => {
    doc
      .fontSize (12)
      .text (
        `${t.date.toDateString ()} | ${t.type.toUpperCase ()} | ${t.category} | ₹${t.amount}`
      );
  });

  doc.end ();
};

// 📑 CSV report
export const downloadCSV = async (req, res) => {
  const userId = req.user._id;

  const start = new Date ();
  start.setDate (1);
  start.setHours (0, 0, 0, 0);

  const txns = await Transaction.find ({
    user: userId,
    date: {$gte: start, $lte: new Date ()},
  });

  const fields = [
    'date',
    'type',
    'category',
    'amount',
    'paymentMode',
    'description',
  ];
  const parser = new Parser ({fields});
  const csv = parser.parse (txns);

  res.header ('Content-Type', 'text/csv');
  res.attachment ('report.csv');
  return res.send (csv);
};
