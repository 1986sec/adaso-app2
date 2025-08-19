const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const generateCompaniesExcel = async (companies) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Firmalar');

  worksheet.columns = [
    { header: 'Firma Adı', key: 'companyName', width: 20 },
    { header: 'Yetkili Kişi', key: 'contactPerson', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Telefon', key: 'phone', width: 15 },
    { header: 'Sektör', key: 'sector', width: 15 },
    { header: 'Durum', key: 'status', width: 12 }
  ];

  companies.forEach(company => {
    worksheet.addRow(company);
  });

  return workbook.xlsx.writeBuffer();
};

const generateVisitsExcel = async (visits) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ziyaretler');

  worksheet.columns = [
    { header: 'Firma', key: 'company', width: 20 },
    { header: 'Ziyaret Tarihi', key: 'visitDate', width: 15 },
    { header: 'Durum', key: 'status', width: 12 },
    { header: 'Tür', key: 'visitType', width: 12 },
    { header: 'Notlar', key: 'notes', width: 30 }
  ];

  visits.forEach(visit => {
    worksheet.addRow(visit);
  });

  return workbook.xlsx.writeBuffer();
};

const generateFinancialPDF = (transactions) => {
  const doc = new PDFDocument();
  
  doc.fontSize(20).text('Finansal Rapor', 100, 100);
  
  let y = 150;
  transactions.forEach(transaction => {
    doc.fontSize(12).text(`${transaction.description}: ${transaction.amount} TL`, 100, y);
    y += 20;
  });

  return doc;
};

module.exports = {
  generateCompaniesExcel,
  generateVisitsExcel,
  generateFinancialPDF
};