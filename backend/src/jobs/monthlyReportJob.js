import cron from 'node-cron';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import PDFDocument from 'pdfkit';
import sendEmail from '../utils/sendEmail.js';

// 📅 Runs at 9 AM on 1st of every month
const monthlyReportJob = () => {
  cron.schedule ('0 9 1 * *', async () => {
    console.log ('📧 Running monthly report job...');

    const users = await User.find ();

    const now = new Date ();
    const start = new Date (now.getFullYear (), now.getMonth () - 1, 1);
    const end = new Date (now.getFullYear (), now.getMonth (), 0, 23, 59, 59);

    for (const user of users) {
      const txns = await Transaction.find ({
        user: user._id,
        date: {$gte: start, $lte: end},
      });

      if (!txns.length) continue;

      // 📄 Create PDF in memory
      const doc = new PDFDocument ();
      let buffers = [];

      doc.on ('data', buffers.push.bind (buffers));
      doc.on ('end', async () => {
        const pdfData = Buffer.concat (buffers);

        await sendEmail ({
          to: user.email,
          subject: '📊 Your SpendWise Monthly Report',
          text: `Hi ${user.name},\n\nAttached is your expense report for last month.\n\n- SpendWise`,
          attachments: [
            {
              filename: 'monthly-report.pdf',
              content: pdfData,
            },
          ],
        });
      });

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
    }
  });
};

export default monthlyReportJob;
