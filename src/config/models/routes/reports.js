const express = require('express');
const path = require('path');
const Company = require(path.join(process.cwd(), 'src', 'config', 'models', 'Company.js'));
const Visit = require(path.join(process.cwd(), 'src', 'config', 'models', 'Visit.js'));
const Transaction = require(path.join(process.cwd(), 'src', 'config', 'models', 'Transaction.js'));
const { authenticateToken } = require(path.join(process.cwd(), 'src', 'config', 'models', 'routes', 'middleware', 'auth.js'));
const { generateCompaniesExcel, generateVisitsExcel, generateFinancialPDF } = require(path.join(process.cwd(), 'src', 'utils', 'reportGenerator.js'));
const router = express.Router();

// Dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalVisits = await Visit.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const monthlyRevenue = await Transaction.aggregate([
      {
        $match: {
          type: 'income',
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentVisits = await Visit.find()
      .populate('company', 'companyName')
      .sort({ visitDate: -1 })
      .limit(5);

    const upcomingVisits = await Visit.find({
      visitDate: { $gte: new Date() },
      status: 'planned'
    })
      .populate('company', 'companyName')
      .sort({ visitDate: 1 })
      .limit(5);

    res.json({
      totalCompanies,
      totalVisits,
      totalTransactions,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      recentVisits,
      upcomingVisits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export companies to Excel
router.get('/export/companies', authenticateToken, async (req, res) => {
  try {
    const companies = await Company.find().populate('createdBy', 'fullName');
    const buffer = await generateCompaniesExcel(companies);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=companies.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export visits to Excel
router.get('/export/visits', authenticateToken, async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate('company', 'companyName')
      .populate('createdBy', 'fullName');
    const buffer = await generateVisitsExcel(visits);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=visits.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate financial PDF report
router.get('/pdf/financial', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('createdBy', 'fullName')
      .sort({ date: -1 });
    
    const doc = generateFinancialPDF(transactions);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=financial-report.pdf');
    
    doc.pipe(res);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;