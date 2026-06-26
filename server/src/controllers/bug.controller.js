const ExcelJS = require('exceljs');
const Bug = require('../models/bug.model');
const Counter = require('../models/counter.model');
const TestCase = require('../models/testCase.model');
const TestRun = require('../models/testRun.model');
const { success, error } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const create = async (req, res, next) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { project: req.project._id, name: 'bug' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const bugKey = `BR-${String(counter.seq).padStart(3, '0')}`;

    const bug = await Bug.create({
      ...req.body,
      bugKey,
      project: req.project._id,
      reportedBy: req.user.id,
    });

    res.status(201).json(success(bug));
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const filter = { project: req.project._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.bugType) filter.bugType = req.query.bugType;

    const bugs = await Bug.find(filter)
      .populate('reportedBy', 'name')
      .populate('linkedTestCase', 'title')
      .sort({ createdAt: -1 });

    res.json(success(bugs));
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const bug = await Bug.findOne({
      _id: req.params.bugId,
      project: req.project._id,
    })
      .populate('reportedBy', 'name')
      .populate('linkedTestCase', 'title')
      .populate({
        path: 'linkedExecution',
        populate: { path: 'testRun', select: 'name' },
      });

    if (!bug) {
      return res.status(404).json(error('Bug not found'));
    }

    res.json(success(bug));
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const bug = await Bug.findOneAndUpdate(
      { _id: req.params.bugId, project: req.project._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('reportedBy', 'name')
      .populate('linkedTestCase', 'title');

    if (!bug) {
      return res.status(404).json(error('Bug not found'));
    }

    res.json(success(bug));
  } catch (err) {
    next(err);
  }
};

const changeStatus = async (req, res, next) => {
  try {
    const bug = await Bug.findOneAndUpdate(
      { _id: req.params.bugId, project: req.project._id },
      { status: req.body.status },
      { new: true }
    )
      .populate('reportedBy', 'name')
      .populate('linkedTestCase', 'title');

    if (!bug) {
      return res.status(404).json(error('Bug not found'));
    }

    res.json(success(bug));
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const bug = await Bug.findOneAndDelete({
      _id: req.params.bugId,
      project: req.project._id,
    });

    if (!bug) {
      return res.status(404).json(error('Bug not found'));
    }

    res.json(success(null, 'Bug deleted'));
  } catch (err) {
    next(err);
  }
};

const exportReport = async (req, res, next) => {
  try {
    const filter = { project: req.project._id };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.bugType) filter.bugType = req.query.bugType;

    const bugs = await Bug.find(filter)
      .populate('reportedBy', 'name')
      .populate('linkedTestCase', 'title')
      .populate({
        path: 'linkedExecution',
        populate: { path: 'testRun', select: 'name' },
      })
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bug Report');

    sheet.columns = [
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Bug ID', key: 'bugKey', width: 12 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Bug Type', key: 'bugType', width: 18 },
      { header: 'URL', key: 'url', width: 25 },
      { header: 'Environment', key: 'environment', width: 22 },
      { header: 'Severity', key: 'severity', width: 12 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Steps to Reproduce', key: 'stepsToReproduce', width: 35 },
      { header: 'Expected Result', key: 'expectedResult', width: 30 },
      { header: 'Actual Result', key: 'actualResult', width: 30 },
      { header: 'Linked Test Case', key: 'linkedTestCaseTitle', width: 22 },
      { header: 'Linked Run', key: 'linkedRunName', width: 22 },
      { header: 'GitHub Issue', key: 'githubIssueNumber', width: 14 },
      { header: 'Reported By', key: 'reportedByName', width: 18 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    const priorityFill = {
      low: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9EAD3' } },
      medium: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE5A8' } },
      high: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F4CCCC' } },
      critical: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EA9999' } },
    };

    const headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' }, size: 11 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'A24B6E' } },
      alignment: { vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
    };

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = headerStyle.font;
      cell.fill = headerStyle.fill;
      cell.alignment = headerStyle.alignment;
      cell.border = headerStyle.border;
    });
    headerRow.height = 20;

    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    const wrapCols = ['description', 'stepsToReproduce', 'expectedResult', 'actualResult'];

    bugs.forEach((bug) => {
      const row = sheet.addRow({
        priority: bug.priority,
        bugKey: bug.bugKey,
        title: bug.title,
        description: bug.description,
        bugType: bug.bugType,
        url: bug.url,
        environment: bug.environment,
        severity: bug.severity,
        status: bug.status,
        stepsToReproduce: bug.stepsToReproduce,
        expectedResult: bug.expectedResult,
        actualResult: bug.actualResult,
        linkedTestCaseTitle: bug.linkedTestCase?.title || '',
        linkedRunName: bug.linkedExecution?.testRun?.name || '',
        githubIssueNumber: bug.githubIssueNumber || '',
        reportedByName: bug.reportedBy?.name || '',
        createdAt: bug.createdAt ? bug.createdAt.toISOString().split('T')[0] : '',
        updatedAt: bug.updatedAt ? bug.updatedAt.toISOString().split('T')[0] : '',
      });

      const rowNum = row.number;

      const priorityCell = sheet.getCell(`A${rowNum}`);
      if (priorityFill[bug.priority]) {
        priorityCell.fill = priorityFill[bug.priority];
      }
      priorityCell.font = { color: { argb: '222222' }, size: 10 };

      if (bug.url) {
        const urlCell = sheet.getCell(`F${rowNum}`);
        urlCell.value = { text: bug.url, hyperlink: bug.url };
        urlCell.font = { color: { argb: '0563C1' }, underline: true, size: 10 };
      }

      wrapCols.forEach((key) => {
        const colIndex = sheet.columns.findIndex((c) => c.key === key) + 1;
        const cell = sheet.getCell(rowNum, colIndex);
        cell.alignment = { wrapText: true };
      });

      const dataCellStyle = {
        font: { size: 10 },
        alignment: { vertical: 'top' },
        border: {
          top: { style: 'thin', color: { argb: 'D9D9D9' } },
          left: { style: 'thin', color: { argb: 'D9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'D9D9D9' } },
          right: { style: 'thin', color: { argb: 'D9D9D9' } },
        },
      };

      sheet.getRow(rowNum).eachCell((cell) => {
        if (!cell.font || !cell.font.color) {
          cell.font = { ...cell.font, size: 10 };
        }
        cell.border = dataCellStyle.border;
        if (!cell.alignment || !cell.alignment.wrapText) {
          cell.alignment = { ...cell.alignment, vertical: 'top' };
        }
      });
    });

    const priorityCol = sheet.getColumn(1);
    priorityCol.eachCell((cell, rowNum) => {
      if (rowNum > 1) {
        cell.dataValidation = {
          type: 'list',
          formulae: ['"low,medium,high,critical"'],
          showErrorMessage: true,
          errorTitle: 'Invalid priority',
          error: 'Select low, medium, high, or critical',
        };
      }
    });

    const bugTypeCol = sheet.getColumn(5);
    bugTypeCol.eachCell((cell, rowNum) => {
      if (rowNum > 1) {
        cell.dataValidation = {
          type: 'list',
          formulae: ['"UI,Functional,Performance,Security,Compatibility,Content,Usability"'],
          showErrorMessage: true,
          errorTitle: 'Invalid bug type',
          error: 'Select a valid bug type',
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="qa-bug-report.xlsx"');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create: asyncHandler(create),
  list: asyncHandler(list),
  get: asyncHandler(get),
  update: asyncHandler(update),
  changeStatus: asyncHandler(changeStatus),
  remove: asyncHandler(remove),
  exportReport: asyncHandler(exportReport),
};
